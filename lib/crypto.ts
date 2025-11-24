/**
 * Encryption Utilities for Private Keys
 *
 * Uses AES-256-GCM for encryption
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SALT = process.env.ENCRYPTION_SALT || 'x402-facilitator-salt-change-in-production';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Derive encryption key from password
 */
function deriveKey(password: string): Buffer {
  return crypto.scryptSync(password, SALT, KEY_LENGTH);
}

/**
 * Encrypt private key with password
 * @param privateKey - The private key to encrypt (with or without 0x prefix)
 * @param password - User's password
 * @returns Encrypted string in format: iv:authTag:encryptedData
 */
export function encryptPrivateKey(privateKey: string, password: string): string {
  // Remove 0x prefix if present
  const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;

  // Validate private key (should be 64 hex characters)
  if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
    throw new Error('Invalid private key format');
  }

  // Generate IV
  const iv = crypto.randomBytes(IV_LENGTH);

  // Derive key from password
  const key = deriveKey(password);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt
  let encrypted = cipher.update(cleanKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get auth tag
  const authTag = cipher.getAuthTag();

  // Return combined: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt private key with password
 * @param encryptedKey - Encrypted key in format: iv:authTag:encryptedData
 * @param password - User's password
 * @returns Decrypted private key (without 0x prefix)
 */
export function decryptPrivateKey(encryptedKey: string, password: string): string {
  try {
    // Split the encrypted string
    const parts = encryptedKey.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted key format');
    }

    const [ivHex, authTagHex, encrypted] = parts;

    // Convert from hex
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    // Derive key from password
    const key = deriveKey(password);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt private key. Wrong password?');
  }
}

/**
 * Generate a random password for server-side encryption
 * (if you want to store keys without user password)
 */
export function generateServerPassword(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash password for comparison (not used for encryption)
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
