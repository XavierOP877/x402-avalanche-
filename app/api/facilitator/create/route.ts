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
  getFacilitatorsByCreator,
  type Facilitator,
} from '@/lib/facilitator-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      encryptedPrivateKey,
      systemEncryptedKey,
      facilitatorWallet,
      paymentRecipient,
      createdBy,
      registrationTxHash,
    } = body;

    // Validate required fields
    if (!name || !encryptedPrivateKey || !systemEncryptedKey || !facilitatorWallet || !paymentRecipient || !createdBy || !registrationTxHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already has a facilitator (one facilitator per wallet)
    const existingFacilitators = await getFacilitatorsByCreator(createdBy);
    if (existingFacilitators.length > 0) {
      return NextResponse.json(
        { error: 'You already have a facilitator. Each wallet can only create one facilitator.' },
        { status: 400 }
      );
    }

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

    // Return public info
    return NextResponse.json({
      success: true,
      facilitator: {
        id: facilitator.id,
        facilitatorWallet: facilitator.facilitatorWallet,
        paymentRecipient: facilitator.paymentRecipient,
        status: facilitator.status,
        createdAt: facilitator.createdAt,
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
