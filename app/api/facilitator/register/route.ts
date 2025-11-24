/**
 * POST /api/facilitator/register
 *
 * Register a new user facilitator
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerFacilitator } from '@/lib/facilitator-db';
import { validatePasswordStrength } from '@/lib/crypto';
import { isAddress } from 'viem';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ownerAddress,
      privateKey,
      recipientAddress,
      network,
      password,
      displayName,
      description,
    } = body;

    // Validate required fields
    if (!ownerAddress || !privateKey || !recipientAddress || !network || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'ownerAddress, privateKey, recipientAddress, network, and password are required'
        },
        { status: 400 }
      );
    }

    // Validate addresses
    if (!isAddress(ownerAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid owner address' },
        { status: 400 }
      );
    }

    if (!isAddress(recipientAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid recipient address' },
        { status: 400 }
      );
    }

    // Validate private key format (64 hex chars, with or without 0x)
    const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
      return NextResponse.json(
        { success: false, error: 'Invalid private key format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Weak password',
          message: passwordValidation.errors.join(', ')
        },
        { status: 400 }
      );
    }

    // Register facilitator
    const facilitator = await registerFacilitator(
      ownerAddress,
      `0x${cleanKey}`,
      recipientAddress,
      network,
      password,
      displayName,
      description
    );

    // Return public info (don't expose private key or encrypted key)
    return NextResponse.json({
      success: true,
      facilitator: {
        id: facilitator.id,
        ownerAddress: facilitator.ownerAddress,
        facilitatorWalletAddress: facilitator.facilitatorWalletAddress,
        recipientAddress: facilitator.recipientAddress,
        network: facilitator.network,
        status: facilitator.status,
        displayName: facilitator.displayName,
        description: facilitator.description,
      },
      message: 'Facilitator registered successfully. Please fund the gas wallet to activate.'
    });
  } catch (error) {
    console.error('Facilitator registration error:', error);

    // Handle specific errors
    if (error instanceof Error && error.message.includes('already have')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to register facilitator',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
