/**
 * Facilitator Database Operations (Upstash Redis)
 */

import { Redis } from '@upstash/redis';

// Lazy-load Redis client (only when env vars are set)
let kv: Redis | null = null;

function getRedisClient(): Redis {
  if (!kv) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token || url.includes('your-upstash')) {
      throw new Error(
        'Upstash Redis not configured. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables. ' +
        'Get them from: https://console.upstash.com/'
      );
    }

    kv = new Redis({ url, token });
  }
  return kv;
}
import {
  UserFacilitator,
  PublicFacilitatorInfo,
  REDIS_KEYS,
  toPublicInfo,
  generateFacilitatorId,
} from './facilitator';
import { encryptPrivateKey, decryptPrivateKey } from './crypto';

// ==========================================
// CREATE & REGISTER
// ==========================================

/**
 * Register a new facilitator
 */
export async function registerFacilitator(
  ownerAddress: `0x${string}`,
  privateKey: string,
  recipientAddress: `0x${string}`,
  network: string,
  password: string,
  displayName?: string,
  description?: string
): Promise<UserFacilitator> {
  // Check if user already has a facilitator
  const existing = await getFacilitatorByOwner(ownerAddress);
  if (existing) {
    throw new Error('You already have a registered facilitator');
  }

  // Generate facilitator ID
  const id = generateFacilitatorId(ownerAddress);

  // Encrypt private key
  const encryptedPrivateKey = encryptPrivateKey(privateKey, password);

  // Derive facilitator wallet address from private key
  const { privateKeyToAccount } = await import('viem/accounts');
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const facilitatorWalletAddress = account.address;

  // Create facilitator object
  const facilitator: UserFacilitator = {
    id,
    ownerAddress,
    facilitatorWalletAddress,
    encryptedPrivateKey,
    recipientAddress,
    network,
    status: 'pending', // Start as pending until gas is funded
    gasBalance: '0',
    totalTransactions: 0,
    createdAt: Date.now(),
    lastUsed: 0,
    displayName,
    description,
  };

  // Store in Redis
  const redis = getRedisClient();
  await redis.set(REDIS_KEYS.facilitator(id), JSON.stringify(facilitator));
  await redis.set(REDIS_KEYS.byOwner(ownerAddress), id);
  await redis.set(REDIS_KEYS.byRecipient(recipientAddress), id);
  await redis.sadd(REDIS_KEYS.allList(), id);

  return facilitator;
}

// ==========================================
// READ OPERATIONS
// ==========================================

/**
 * Get facilitator by ID
 */
export async function getFacilitator(id: string): Promise<UserFacilitator | null> {
  const redis = getRedisClient();
  const data = await redis.get<string>(REDIS_KEYS.facilitator(id));
  if (!data) return null;
  return JSON.parse(data);
}

/**
 * Get facilitator by owner address
 */
export async function getFacilitatorByOwner(
  ownerAddress: string
): Promise<UserFacilitator | null> {
  const redis = getRedisClient();
  const id = await redis.get<string>(REDIS_KEYS.byOwner(ownerAddress.toLowerCase()));
  if (!id) return null;
  return getFacilitator(id);
}

/**
 * Get facilitator by recipient address
 */
export async function getFacilitatorByRecipient(
  recipientAddress: string
): Promise<UserFacilitator | null> {
  const redis = getRedisClient();
  const id = await redis.get<string>(REDIS_KEYS.byRecipient(recipientAddress.toLowerCase()));
  if (!id) return null;
  return getFacilitator(id);
}

/**
 * Get all active facilitators (public info only)
 */
export async function getActiveFacilitators(): Promise<PublicFacilitatorInfo[]> {
  const redis = getRedisClient();
  const activeIds = await redis.smembers(REDIS_KEYS.activeList());
  if (!activeIds || activeIds.length === 0) return [];

  const facilitators: PublicFacilitatorInfo[] = [];

  for (const id of activeIds) {
    const facilitator = await getFacilitator(id as string);
    if (facilitator && facilitator.status === 'active') {
      facilitators.push(toPublicInfo(facilitator));
    }
  }

  // Sort by last used (most recent first)
  return facilitators.sort((a, b) => b.lastUsed - a.lastUsed);
}

/**
 * Get all facilitators (for admin)
 */
export async function getAllFacilitators(): Promise<PublicFacilitatorInfo[]> {
  const redis = getRedisClient();
  const allIds = await redis.smembers(REDIS_KEYS.allList());
  if (!allIds || allIds.length === 0) return [];

  const facilitators: PublicFacilitatorInfo[] = [];

  for (const id of allIds) {
    const facilitator = await getFacilitator(id as string);
    if (facilitator) {
      facilitators.push(toPublicInfo(facilitator));
    }
  }

  return facilitators.sort((a, b) => b.lastUsed - a.lastUsed);
}

// ==========================================
// UPDATE OPERATIONS
// ==========================================

/**
 * Update facilitator details
 */
export async function updateFacilitator(
  id: string,
  updates: Partial<UserFacilitator>
): Promise<UserFacilitator | null> {
  const facilitator = await getFacilitator(id);
  if (!facilitator) return null;

  const redis = getRedisClient();

  // If recipient address is changing, update the index
  if (updates.recipientAddress && updates.recipientAddress !== facilitator.recipientAddress) {
    await redis.del(REDIS_KEYS.byRecipient(facilitator.recipientAddress));
    await redis.set(REDIS_KEYS.byRecipient(updates.recipientAddress), id);
  }

  // If status is changing to active, add to active list
  if (updates.status === 'active' && facilitator.status !== 'active') {
    await redis.sadd(REDIS_KEYS.activeList(), id);
  }

  // If status is changing from active, remove from active list
  if (updates.status !== 'active' && facilitator.status === 'active') {
    await redis.srem(REDIS_KEYS.activeList(), id);
  }

  // Merge updates
  const updated: UserFacilitator = {
    ...facilitator,
    ...updates,
  };

  // Save
  await redis.set(REDIS_KEYS.facilitator(id), JSON.stringify(updated));

  return updated;
}

/**
 * Update gas balance
 */
export async function updateGasBalance(id: string, balance: string): Promise<void> {
  await updateFacilitator(id, { gasBalance: balance });
}

/**
 * Increment transaction count
 */
export async function incrementTransactionCount(id: string): Promise<void> {
  const facilitator = await getFacilitator(id);
  if (!facilitator) return;

  await updateFacilitator(id, {
    totalTransactions: facilitator.totalTransactions + 1,
    lastUsed: Date.now(),
  });
}

/**
 * Activate facilitator (when gas is funded)
 */
export async function activateFacilitator(id: string): Promise<UserFacilitator | null> {
  return updateFacilitator(id, { status: 'active' });
}

/**
 * Deactivate facilitator
 */
export async function deactivateFacilitator(id: string): Promise<UserFacilitator | null> {
  return updateFacilitator(id, { status: 'inactive' });
}

// ==========================================
// DELETE OPERATIONS
// ==========================================

/**
 * Delete facilitator
 */
export async function deleteFacilitator(id: string): Promise<boolean> {
  const facilitator = await getFacilitator(id);
  if (!facilitator) return false;

  const redis = getRedisClient();

  // Remove all keys
  await redis.del(REDIS_KEYS.facilitator(id));
  await redis.del(REDIS_KEYS.byOwner(facilitator.ownerAddress));
  await redis.del(REDIS_KEYS.byRecipient(facilitator.recipientAddress));
  await redis.srem(REDIS_KEYS.allList(), id);
  await redis.srem(REDIS_KEYS.activeList(), id);

  return true;
}

// ==========================================
// PRIVATE KEY OPERATIONS
// ==========================================

/**
 * Get decrypted private key (use with caution!)
 */
export async function getDecryptedPrivateKey(
  id: string,
  password: string
): Promise<string | null> {
  const facilitator = await getFacilitator(id);
  if (!facilitator) return null;

  try {
    return decryptPrivateKey(facilitator.encryptedPrivateKey, password);
  } catch (error) {
    console.error('Failed to decrypt private key:', error);
    return null;
  }
}
