/**
 * Facilitator Types and Utilities
 *
 * Manages user-run facilitators for x402 payments
 */

// ==========================================
// TYPE DEFINITIONS
// ==========================================

/**
 * User Facilitator Configuration
 */
export interface UserFacilitator {
  id: string; // Unique facilitator ID
  ownerAddress: `0x${string}`; // Wallet that registered this facilitator
  facilitatorWalletAddress: `0x${string}`; // Public address of gas wallet
  encryptedPrivateKey: string; // AES encrypted private key
  recipientAddress: `0x${string}`; // Where USDC payments are sent
  network: string; // e.g., 'avalanche-fuji'
  status: 'active' | 'inactive' | 'pending';
  gasBalance: string; // AVAX balance (updated periodically)
  totalTransactions: number; // Number of payments processed
  createdAt: number; // Unix timestamp
  lastUsed: number; // Unix timestamp of last transaction
  displayName?: string; // Optional name for the facilitator
  description?: string; // Optional description
}

/**
 * Public Facilitator Info (what users see when selecting)
 */
export interface PublicFacilitatorInfo {
  id: string;
  displayName: string;
  ownerAddress: `0x${string}`;
  recipientAddress: `0x${string}`;
  network: string;
  status: 'active' | 'inactive' | 'pending';
  totalTransactions: number;
  gasBalance: string;
  lastUsed: number;
}

/**
 * Facilitator Registration Request
 */
export interface FacilitatorRegistrationRequest {
  ownerAddress: `0x${string}`;
  privateKey: string; // Will be encrypted server-side
  recipientAddress: `0x${string}`;
  network: string;
  password: string; // For encryption
  displayName?: string;
  description?: string;
}

/**
 * Facilitator Update Request
 */
export interface FacilitatorUpdateRequest {
  id: string;
  recipientAddress?: `0x${string}`;
  displayName?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Generate a unique facilitator ID
 */
export function generateFacilitatorId(ownerAddress: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `fac_${ownerAddress.slice(2, 8)}_${timestamp}_${random}`;
}

/**
 * Convert UserFacilitator to PublicFacilitatorInfo
 * (removes sensitive data)
 */
export function toPublicInfo(facilitator: UserFacilitator): PublicFacilitatorInfo {
  return {
    id: facilitator.id,
    displayName: facilitator.displayName || `Facilitator by ${facilitator.ownerAddress.slice(0, 6)}...`,
    ownerAddress: facilitator.ownerAddress,
    recipientAddress: facilitator.recipientAddress,
    network: facilitator.network,
    status: facilitator.status,
    totalTransactions: facilitator.totalTransactions,
    gasBalance: facilitator.gasBalance,
    lastUsed: facilitator.lastUsed,
  };
}

/**
 * Validate facilitator is ready to process payments
 */
export function isFacilitatorReady(facilitator: UserFacilitator): boolean {
  if (facilitator.status !== 'active') return false;

  // Check gas balance (need at least 0.1 AVAX)
  const gasBalance = parseFloat(facilitator.gasBalance);
  if (gasBalance < 0.1) return false;

  return true;
}

/**
 * Format gas balance for display
 */
export function formatGasBalance(balance: string): string {
  const bal = parseFloat(balance);
  if (bal === 0) return '0 AVAX';
  if (bal < 0.01) return `${bal.toFixed(6)} AVAX`;
  return `${bal.toFixed(2)} AVAX`;
}

// ==========================================
// REDIS KEY PATTERNS
// ==========================================

/**
 * Redis key patterns for Vercel KV
 */
export const REDIS_KEYS = {
  // facilitator:{id} → UserFacilitator JSON
  facilitator: (id: string) => `facilitator:${id}`,

  // facilitator:by-owner:{ownerAddress} → facilitator ID
  byOwner: (ownerAddress: string) => `facilitator:by-owner:${ownerAddress.toLowerCase()}`,

  // facilitator:by-recipient:{recipientAddress} → facilitator ID
  byRecipient: (recipientAddress: string) => `facilitator:by-recipient:${recipientAddress.toLowerCase()}`,

  // facilitator:active → Set of active facilitator IDs
  activeList: () => `facilitator:active`,

  // facilitator:all → Set of all facilitator IDs
  allList: () => `facilitator:all`,
};
