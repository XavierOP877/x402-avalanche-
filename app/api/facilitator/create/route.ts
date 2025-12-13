/**
 * POST /api/facilitator/create
 *
 * Create a new facilitator
 * User must provide:
 * - Encrypted private key
 * - Facilitator wallet address
 * - Payment recipient address
 * - Registration transaction hash (x402 payment proof)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  storeFacilitator,
  generateFacilitatorId,
  type Facilitator,
} from '@/lib/facilitator-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      encryptedPrivateKey,
      privateKey, // Plain private key for system encryption
      facilitatorWallet,
      paymentRecipient,
      createdBy,
      registrationTxHash,
    } = body;

    // Validate required fields
    if (!name || !encryptedPrivateKey || !privateKey || !facilitatorWallet || !paymentRecipient || !createdBy || !registrationTxHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get system master key for encryption
    const masterKey = process.env.SYSTEM_MASTER_KEY;
    if (!masterKey) {
      console.error('❌ SYSTEM_MASTER_KEY not set');
      return NextResponse.json(
        { error: 'System configuration error - master key not configured' },
        { status: 500 }
      );
    }

    // Encrypt private key with system master key
    const { encryptPrivateKey } = await import('@/lib/facilitator-crypto');
    const systemEncryptedKey = encryptPrivateKey(privateKey, masterKey);

    // Validate name
    if (name.length < 3 || name.length > 50) {
      return NextResponse.json(
        { error: 'Facilitator name must be between 3 and 50 characters' },
        { status: 400 }
      );
    }

    // Validate addresses
    if (!facilitatorWallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid facilitator wallet address' },
        { status: 400 }
      );
    }

    if (!paymentRecipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid payment recipient address' },
        { status: 400 }
      );
    }

    if (!createdBy.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid creator address' },
        { status: 400 }
      );
    }

    // Verify registration payment on-chain
    console.log('🔍 Verifying registration payment...');
    const { verifyRegistrationPayment } = await import('@/lib/verify-payment');
    const verification = await verifyRegistrationPayment(registrationTxHash, createdBy);

    if (!verification.valid) {
      console.error('❌ Payment verification failed:', verification.error);
      return NextResponse.json(
        { error: `Payment verification failed: ${verification.error}` },
        { status: 400 }
      );
    }

    console.log('✅ Registration payment verified:', verification.details);

    // Generate facilitator ID
    const id = generateFacilitatorId();

    // Create facilitator object
    const facilitator: Facilitator = {
      id,
      name,
      encryptedPrivateKey,
      systemEncryptedKey,
      facilitatorWallet,
      paymentRecipient,
      createdBy,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      totalPayments: 0,
      status: 'needs_funding',
      registrationTxHash,
    };

    // Store in Redis
    await storeFacilitator(facilitator);

    console.log(`✅ Created facilitator: ${id} by ${createdBy}`);

    // Register on-chain (ERC-8004 Identity Registry)
    let onChainId = null;
    let onChainRegistrationTx = null;

    try {
      console.log('🔗 Registering facilitator on-chain...');

      // Create registration file data (could be stored on IPFS)
      const registrationData = {
        type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
        name: name,
        description: `x402 Facilitator - ${name}`,
        image: "", // TODO: Add facilitator image
        endpoints: [
          {
            name: "agentWallet",
            endpoint: `eip155:43113:${facilitatorWallet}`
          },
          {
            name: "paymentRecipient",
            endpoint: `eip155:43113:${paymentRecipient}`
          }
        ],
        supportedTrust: ["reputation"]
      };

      // For now, use a simple data URI (in production, upload to IPFS)
      const dataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(registrationData)).toString('base64')}`;

      // Register on-chain using backend wallet
      // NOTE: This requires a backend wallet with AVAX for gas
      // In production, you might want the user to do this transaction
      const { registerFacilitatorOnChain } = await import('@/lib/reputation-contract');
      const { ethers } = await import('ethers');

      if (process.env.BACKEND_WALLET_PRIVATE_KEY) {
        const provider = new ethers.JsonRpcProvider(
          process.env.NEXT_PUBLIC_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'
        );
        const backendSigner = new ethers.Wallet(process.env.BACKEND_WALLET_PRIVATE_KEY, provider);

        const result = await registerFacilitatorOnChain(dataUri, backendSigner);
        onChainId = result.facilitatorId;
        onChainRegistrationTx = result.txHash;

        console.log(`✅ Facilitator registered on-chain: ID ${onChainId}, TX ${onChainRegistrationTx}`);
      } else {
        console.warn('⚠️ BACKEND_WALLET_PRIVATE_KEY not set, skipping on-chain registration');
      }
    } catch (error) {
      console.error('❌ Failed to register on-chain:', error);
      // Don't fail the entire request - facilitator is still created in Redis
    }

    // Return public info
    return NextResponse.json({
      success: true,
      facilitator: {
        id: facilitator.id,
        facilitatorWallet: facilitator.facilitatorWallet,
        paymentRecipient: facilitator.paymentRecipient,
        status: facilitator.status,
        createdAt: facilitator.createdAt,
        onChainId, // ERC-8004 facilitator ID (null if not registered)
        onChainTxHash: onChainRegistrationTx,
      },
    });
  } catch (error) {
    console.error('❌ Error creating facilitator:', error);
    return NextResponse.json(
      { error: 'Failed to create facilitator' },
      { status: 500 }
    );
  }
}
