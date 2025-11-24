/**
 * POST /api/facilitator/activate
 *
 * Activate a facilitator (checks gas balance first)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFacilitator, activateFacilitator, updateGasBalance } from '@/lib/facilitator-db';
import { createPublicClient, http, formatEther } from 'viem';
import { avalancheFuji } from 'viem/chains';

const MIN_GAS_BALANCE = 0.1; // Minimum 0.1 AVAX required

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facilitatorId, ownerAddress } = body;

    if (!facilitatorId || !ownerAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get facilitator
    const facilitator = await getFacilitator(facilitatorId);

    if (!facilitator) {
      return NextResponse.json(
        { success: false, error: 'Facilitator not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (facilitator.ownerAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Check gas balance
    const client = createPublicClient({
      chain: avalancheFuji,
      transport: http(process.env.RPC_URL_AVALANCHE_FUJI || 'https://api.avax-test.network/ext/bc/C/rpc'),
    });

    const balance = await client.getBalance({
      address: facilitator.facilitatorWalletAddress,
    });

    const balanceInAvax = parseFloat(formatEther(balance));

    // Update gas balance in database
    await updateGasBalance(facilitatorId, balanceInAvax.toString());

    // Check if sufficient balance
    if (balanceInAvax < MIN_GAS_BALANCE) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient gas balance',
          message: `Need at least ${MIN_GAS_BALANCE} AVAX, current balance: ${balanceInAvax.toFixed(4)} AVAX`,
          currentBalance: balanceInAvax.toString(),
          requiredBalance: MIN_GAS_BALANCE.toString(),
        },
        { status: 400 }
      );
    }

    // Activate
    const updated = await activateFacilitator(facilitatorId);

    return NextResponse.json({
      success: true,
      facilitator: {
        id: updated!.id,
        status: updated!.status,
        gasBalance: updated!.gasBalance,
      },
      message: 'Facilitator activated successfully!'
    });
  } catch (error) {
    console.error('Facilitator activation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to activate facilitator',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
