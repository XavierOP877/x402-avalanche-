/**
 * Facilitator Storage
 *
 * Manages facilitator data in Redis
 */

import { getRedis } from './redis';
import { nanoid } from 'nanoid';

export interface Facilitator {
  id: string;
  name: string; // Facilitator name chosen by creator
  encryptedPrivateKey: string; // Encrypted with user's password (for backup)
  systemEncryptedKey: string; // Encrypted with system master key (for backend use)
  facilitatorWallet: string; // The wallet that pays gas
  paymentRecipient: string; // Where USDC payments go
  createdBy: string; // User address who created it
  createdAt: number;
  lastUsed: number;
  totalPayments: number;
  status: 'needs_funding' | 'active' | 'inactive';
  registrationTxHash: string; // x402 payment proof
}

export interface PublicFacilitatorInfo {
  id: string;
  name: string;
  facilitatorWallet: string;
  paymentRecipient: string;
  createdBy: string;
  status: 'needs_funding' | 'active' | 'inactive';
  totalPayments: number;
  lastUsed: number;
  gasBalance?: string; // AVAX balance for gas
}

const REDIS_KEY_PREFIX = 'facilitator:';
const ACTIVE_LIST_KEY = 'facilitators:active';

/**
 * Store a new facilitator
 */
export async function storeFacilitator(facilitator: Facilitator): Promise<void> {
  const redis = getRedis();
  const key = `${REDIS_KEY_PREFIX}${facilitator.id}`;

  // Store facilitator data
  await redis.set(key, JSON.stringify(facilitator));

  // Add to active list
  await redis.sadd(ACTIVE_LIST_KEY, facilitator.id);

  console.log(`✅ Stored facilitator: ${facilitator.id}`);
}

/**
 * Get facilitator by ID
 */
export async function getFacilitator(id: string): Promise<Facilitator | null> {
  const redis = getRedis();
  const key = `${REDIS_KEY_PREFIX}${id}`;

  const data = await redis.get(key);
  if (!data) {
    return null;
  }

  // Upstash REST API returns parsed JSON, not a string
  // Check if data is already an object or needs parsing
  if (typeof data === 'string') {
    return JSON.parse(data) as Facilitator;
  }

  return data as Facilitator;
}

/**
 * Get all active facilitators (public info only)
 */
export async function getActiveFacilitators(): Promise<PublicFacilitatorInfo[]> {
  const redis = getRedis();

  // Get all facilitator IDs
  const ids = await redis.smembers(ACTIVE_LIST_KEY);

  if (!ids || ids.length === 0) {
    return [];
  }

  // Batch fetch all facilitator data at once (much faster than loop)
  const keys = (ids as string[]).map(id => `${REDIS_KEY_PREFIX}${id}`);
  const values = await redis.mget(...keys);

  const facilitators: PublicFacilitatorInfo[] = [];

  for (let i = 0; i < values.length; i++) {
    const data = values[i];
    if (data) {
      // Handle both string and object responses from Upstash
      const facilitator = typeof data === 'string' ? JSON.parse(data) : data;

      facilitators.push({
        id: facilitator.id,
        name: facilitator.name,
        facilitatorWallet: facilitator.facilitatorWallet,
        paymentRecipient: facilitator.paymentRecipient,
        createdBy: facilitator.createdBy,
        status: facilitator.status,
        totalPayments: facilitator.totalPayments,
        lastUsed: facilitator.lastUsed,
      });
    }
  }

  // Sort by last used (most recent first)
  return facilitators.sort((a, b) => b.lastUsed - a.lastUsed);
}

/**
 * Update facilitator status
 */
export async function updateFacilitatorStatus(
  id: string,
  status: 'needs_funding' | 'active' | 'inactive'
): Promise<void> {
  const facilitator = await getFacilitator(id);
  if (!facilitator) {
    throw new Error('Facilitator not found');
  }

  facilitator.status = status;
  await storeFacilitator(facilitator);

  console.log(`✅ Updated facilitator ${id} status to: ${status}`);
}

/**
 * Record a payment processed by facilitator
 */
export async function recordPayment(id: string): Promise<void> {
  const facilitator = await getFacilitator(id);
  if (!facilitator) {
    throw new Error('Facilitator not found');
  }

  facilitator.totalPayments += 1;
  facilitator.lastUsed = Date.now();
  await storeFacilitator(facilitator);

  console.log(`✅ Recorded payment for facilitator ${id}`);
}

/**
 * Get facilitators by creator address
 */
export async function getFacilitatorsByCreator(address: string): Promise<PublicFacilitatorInfo[]> {
  const allFacilitators = await getActiveFacilitators();
  const redis = getRedis();

  const userFacilitators: PublicFacilitatorInfo[] = [];

  for (const publicInfo of allFacilitators) {
    const facilitator = await getFacilitator(publicInfo.id);
    if (facilitator && facilitator.createdBy.toLowerCase() === address.toLowerCase()) {
      userFacilitators.push(publicInfo);
    }
  }

  return userFacilitators;
}

/**
 * Generate unique facilitator ID
 */
export function generateFacilitatorId(): string {
  return `fac_${nanoid(16)}`;
}

/**
 * Delete a facilitator
 */
export async function deleteFacilitator(id: string): Promise<void> {
  const redis = getRedis();
  const key = `${REDIS_KEY_PREFIX}${id}`;

  await redis.del(key);
  await redis.srem(ACTIVE_LIST_KEY, id);

  console.log(`✅ Deleted facilitator: ${id}`);
}
