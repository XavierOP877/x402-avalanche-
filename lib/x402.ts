/**
 * x402 Protocol Utilities
 *
 * This module provides utilities for implementing the x402 payment protocol.
 * x402 is an HTTP-native payment protocol using the 402 Payment Required status code.
 */

import { parseUnits } from 'viem';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

/**
 * x402 Payment Requirements
 * Server sends this in 402 response to specify payment details
 */
export interface X402PaymentRequirements {
  scheme: 'exact';
  network: string;
  resource: string; // The resource being paid for (e.g., "/builder-hub")
  maxAmountRequired: string; // Amount in atomic units (e.g., "1000000" for 1 USDC with 6 decimals)
  payTo: `0x${string}`;
  asset: `0x${string}`; // ERC20 token contract address
  maxTimeoutSeconds: number;
  mimeType?: string;
  description?: string;
}

/**
 * x402 Payment Payload
 * Client sends this in X-PAYMENT header
 */
export interface X402PaymentPayload {
  x402Version: number;
  scheme: 'exact';
  network: string;
  payload: {
    amount: string; // Amount in atomic units
    from: `0x${string}`;
    to: `0x${string}`;
    asset: `0x${string}`;
    deadline: number;
  };
}

/**
 * Facilitator Verify Request
 */
export interface FacilitatorVerifyRequest {
  x402Version: number;
  paymentHeader: string; // Base64-encoded X402PaymentPayload
  paymentRequirements: X402PaymentRequirements;
}

/**
 * Facilitator Verify Response
 */
export interface FacilitatorVerifyResponse {
  isValid: boolean;
  invalidReason?: string;
}

/**
 * Facilitator Settle Request
 */
export interface FacilitatorSettleRequest {
  x402Version: number;
  scheme: 'exact';
  network: string;
  paymentPayload: {  // Changed from 'payload' to 'paymentPayload'
    amount: string;
    from: `0x${string}`;
    to: `0x${string}`;
    asset: `0x${string}`;
    deadline: number;
  };
}

/**
 * Facilitator Settle Response
 */
export interface FacilitatorSettleResponse {
  success: boolean;
  txHash?: `0x${string}`;
  tx?: `0x${string}`; // Alternative field name
  networkId?: string;
  network?: string; // Alternative field name
  error?: string;
  message?: string; // Error message field
}

/**
 * Facilitator Supported Response
 */
export interface FacilitatorSupportedResponse {
  kinds: Array<{
    network: string;
    scheme: string;
    x402Version: number;
  }>;
}

// ==========================================
// CONFIGURATION
// ==========================================

// Log environment variables for debugging
console.log('[x402] Environment check:', {
  PAYMENT_RECIPIENT: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT,
  NETWORK: process.env.NEXT_PUBLIC_NETWORK,
  PAYMENT_AMOUNT: process.env.NEXT_PUBLIC_PAYMENT_AMOUNT,
});

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT) {
  throw new Error('NEXT_PUBLIC_PAYMENT_RECIPIENT environment variable is required');
}

// FORCE the correct address - NO FALLBACK
const CORRECT_RECIPIENT = '0x9c1e7f1652be26b68355b447a76295df7ba94285' as `0x${string}`;

export const X402_CONFIG = {
  VERSION: 1,
  // Use Next.js API proxy routes to avoid CORS issues
  FACILITATOR_URL: '/api/x402', // Proxy through Next.js API
  NETWORK: process.env.NEXT_PUBLIC_NETWORK || 'avalanche-fuji',
  USDC_ADDRESS: (process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x5425890298aed601595a70AB815c96711a31Bc65') as `0x${string}`,
  PAYMENT_RECIPIENT: CORRECT_RECIPIENT, // HARD-CODED for now
  PAYMENT_AMOUNT: process.env.NEXT_PUBLIC_PAYMENT_AMOUNT || '1',
  USDC_DECIMALS: 6,
  TIMEOUT_SECONDS: 300, // 5 minutes
} as const;

console.log('[x402] X402_CONFIG loaded:', {
  PAYMENT_RECIPIENT: X402_CONFIG.PAYMENT_RECIPIENT,
  NETWORK: X402_CONFIG.NETWORK,
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Create payment requirements for a protected resource
 */
export function createPaymentRequirements(
  amountUSDC: string = X402_CONFIG.PAYMENT_AMOUNT,
  resource: string = 'http://localhost:3000/builder-hub'
): X402PaymentRequirements {
  const amountInAtomicUnits = parseUnits(amountUSDC, X402_CONFIG.USDC_DECIMALS).toString();

  return {
    scheme: 'exact',
    network: X402_CONFIG.NETWORK,
    resource: resource,
    maxAmountRequired: amountInAtomicUnits,
    payTo: X402_CONFIG.PAYMENT_RECIPIENT,
    asset: X402_CONFIG.USDC_ADDRESS,
    maxTimeoutSeconds: X402_CONFIG.TIMEOUT_SECONDS,
    mimeType: 'application/json',
    description: 'Payment required to access Builder Hub',
  };
}

/**
 * Create payment payload for submission to facilitator
 */
export function createPaymentPayload(
  fromAddress: `0x${string}`,
  amountUSDC: string = X402_CONFIG.PAYMENT_AMOUNT
): X402PaymentPayload {
  const amountInAtomicUnits = parseUnits(amountUSDC, X402_CONFIG.USDC_DECIMALS).toString();
  const deadline = Math.floor(Date.now() / 1000) + X402_CONFIG.TIMEOUT_SECONDS;

  return {
    x402Version: X402_CONFIG.VERSION,
    scheme: 'exact',
    network: X402_CONFIG.NETWORK,
    payload: {
      amount: amountInAtomicUnits,
      from: fromAddress,
      to: X402_CONFIG.PAYMENT_RECIPIENT,
      asset: X402_CONFIG.USDC_ADDRESS,
      deadline,
    },
  };
}

/**
 * Encode payment payload as base64 for X-PAYMENT header
 */
export function encodePaymentHeader(payload: X402PaymentPayload): string {
  const jsonString = JSON.stringify(payload);
  return Buffer.from(jsonString).toString('base64');
}

/**
 * Decode payment payload from base64 X-PAYMENT header
 */
export function decodePaymentHeader(base64String: string): X402PaymentPayload {
  const jsonString = Buffer.from(base64String, 'base64').toString('utf-8');
  return JSON.parse(jsonString);
}

/**
 * Call facilitator /verify endpoint
 */
export async function verifyPayment(
  paymentHeader: string,
  paymentRequirements: X402PaymentRequirements
): Promise<FacilitatorVerifyResponse> {
  const response = await fetch(`${X402_CONFIG.FACILITATOR_URL}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      x402Version: X402_CONFIG.VERSION,
      paymentHeader,
      paymentRequirements,
    } as FacilitatorVerifyRequest),
  });

  if (!response.ok) {
    throw new Error(`Facilitator verify failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Call facilitator /settle endpoint to execute payment with ERC-3009
 * This is the REAL x402 exact scheme using signed authorization
 */
export async function settlePaymentWithAuthorization(
  signedAuthorizationPayload: any,
  paymentRequirements: X402PaymentRequirements
): Promise<FacilitatorSettleResponse> {
  // Facilitator expects x402Version, paymentPayload, AND paymentRequirements
  const settleRequest = {
    x402Version: 1,
    paymentPayload: signedAuthorizationPayload,
    paymentRequirements: paymentRequirements,
  };

  console.log('[x402] Settle request with ERC-3009:', JSON.stringify(settleRequest, null, 2));

  const response = await fetch(`${X402_CONFIG.FACILITATOR_URL}/settle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settleRequest),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[x402] Settle error:', error);
    throw new Error(`Facilitator settle failed: ${error}`);
  }

  const data = await response.json();
  console.log('[x402] Settle success:', data);
  return data;
}

/**
 * Legacy function - kept for compatibility
 */
export async function settlePayment(
  fromAddress: `0x${string}`,
  amountUSDC: string = X402_CONFIG.PAYMENT_AMOUNT
): Promise<FacilitatorSettleResponse> {
  throw new Error('Use settlePaymentWithAuthorization for ERC-3009 payments');
}

/**
 * Get supported payment methods from facilitator
 */
export async function getSupportedPayments(): Promise<FacilitatorSupportedResponse> {
  const response = await fetch(`${X402_CONFIG.FACILITATOR_URL}/supported`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Facilitator supported failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check if facilitator supports the required payment method
 */
export async function isFacilitatorReady(): Promise<boolean> {
  try {
    const supported = await getSupportedPayments();
    return supported.kinds.some(
      kind =>
        kind.network === X402_CONFIG.NETWORK &&
        kind.scheme === 'exact' &&
        kind.x402Version === X402_CONFIG.VERSION
    );
  } catch (error) {
    console.error('Facilitator not ready:', error);
    return false;
  }
}
