/**
 * POST /api/facilitator/check-and-activate
 *
 * Check facilitator's AVAX balance and automatically update status
 * - If balance >= 0.1 AVAX: set to 'active'
 * - If balance < 0.1 AVAX: keep as 'needs_funding'
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFacilitator, updateFacilitatorStatus } from '@/lib/facilitator-storage';
import { createPublicClient, http, formatEther } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { logEvent } from '@/lib/explorer-logging';

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(process.env.RPC_URL_AVALANCHE_FUJI || 'https://api.avax-test.network/ext/bc/C/rpc'),
});

const MINIMUM_BALANCE = 0.1; // Minimum AVAX required for active status

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facilitatorId } = body;

    if (!facilitatorId) {
      return NextResponse.json(
        { error: 'Missing facilitator ID' },
        { status: 400 }
      );
    }

    // Get facilitator
    const facilitator = await getFacilitator(facilitatorId);
    if (!facilitator) {
      return NextResponse.json(
        { error: 'Facilitator not found' },
        { status: 404 }
      );
    }

    // Check AVAX balance
    console.log(`🔍 Checking balance for facilitator ${facilitatorId} (${facilitator.facilitatorWallet})`);
    const balance = await publicClient.getBalance({
      address: facilitator.facilitatorWallet as `0x${string}`,
    });

    const balanceInAvax = parseFloat(formatEther(balance));
    console.log(`💰 Balance: ${balanceInAvax} AVAX`);

    // Determine new status based on balance
    let newStatus: 'active' | 'needs_funding';
    if (balanceInAvax >= MINIMUM_BALANCE) {
      newStatus = 'active';
      console.log(`✅ Balance sufficient (>= ${MINIMUM_BALANCE} AVAX), setting to active`);
    } else {
      newStatus = 'needs_funding';
      console.log(`⚠️  Balance insufficient (< ${MINIMUM_BALANCE} AVAX), keeping as needs_funding`);
    }

    // Update status if changed
    if (facilitator.status !== newStatus) {
      await updateFacilitatorStatus(facilitatorId, newStatus);
      console.log(`✅ Status updated: ${facilitator.status} → ${newStatus}`);

      // Log activation event
      if (newStatus === 'active') {
        await logEvent({
          eventType: 'facilitator_activated',
          facilitatorId: facilitator.id,
          facilitatorName: facilitator.name,
          gasFundingAmount: `${balanceInAvax.toFixed(4)} AVAX`,
          status: 'success',
        });
      }
    } else {
      console.log(`ℹ️  Status unchanged: ${newStatus}`);
    }

    return NextResponse.json({
      success: true,
      facilitator: {
        id: facilitator.id,
        name: facilitator.name,
        wallet: facilitator.facilitatorWallet,
        balance: balanceInAvax.toFixed(4),
        status: newStatus,
        minimumRequired: MINIMUM_BALANCE,
        isFunded: balanceInAvax >= MINIMUM_BALANCE,
      },
    });
  } catch (error) {
    console.error('❌ Error checking and activating facilitator:', error);
    return NextResponse.json(
      { error: 'Failed to check and activate facilitator' },
      { status: 500 }
    );
  }
}
