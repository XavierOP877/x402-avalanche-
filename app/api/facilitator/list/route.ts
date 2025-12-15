/**
 * GET /api/facilitator/list
 *
 * Get list of all facilitators with real-time status based on AVAX balance
 * Returns public info only (no private keys)
 *
 * Status Logic:
 * - AVAX >= 0.1: status = 'active'
 * - AVAX < 0.1: status = 'needs_funding'
 */

import { NextResponse } from 'next/server';
import { getActiveFacilitators, getFacilitator, updateFacilitatorStatus } from '@/lib/facilitator-storage';
import { createPublicClient, http, formatEther } from 'viem';
import { avalancheFuji } from 'viem/chains';

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(process.env.RPC_URL_AVALANCHE_FUJI || 'https://api.avax-test.network/ext/bc/C/rpc'),
});

const MINIMUM_BALANCE = 0.1; // 0.1 AVAX minimum for active status

export async function GET() {
  try {
    const facilitators = await getActiveFacilitators();

    // Check and update status for each facilitator based on AVAX balance
    const facilitatorsWithUpdatedStatus = await Promise.all(
      facilitators.map(async (publicInfo) => {
        try {
          // Get full facilitator data
          const facilitator = await getFacilitator(publicInfo.id);
          if (!facilitator) return publicInfo;

          // Check AVAX balance
          const balance = await publicClient.getBalance({
            address: facilitator.facilitatorWallet as `0x${string}`,
          });

          const balanceInAvax = parseFloat(formatEther(balance));

          // Determine correct status based on balance
          let correctStatus: 'active' | 'needs_funding';
          if (balanceInAvax >= MINIMUM_BALANCE) {
            correctStatus = 'active';
          } else {
            correctStatus = 'needs_funding';
          }

          // Update status in Redis if it changed
          if (facilitator.status !== correctStatus) {
            await updateFacilitatorStatus(facilitator.id, correctStatus);
            console.log(`✅ Auto-updated ${facilitator.name} status: ${facilitator.status} → ${correctStatus} (balance: ${balanceInAvax.toFixed(4)} AVAX)`);
          }

          // Return public info with updated status
          return {
            ...publicInfo,
            status: correctStatus,
          };
        } catch (error) {
          console.error(`Failed to check balance for ${publicInfo.id}:`, error);
          // Return original info if balance check fails
          return publicInfo;
        }
      })
    );

    return NextResponse.json({
      success: true,
      facilitators: facilitatorsWithUpdatedStatus,
      count: facilitatorsWithUpdatedStatus.length,
    });
  } catch (error) {
    console.error('❌ Error listing facilitators:', error);
    return NextResponse.json(
      { error: 'Failed to list facilitators' },
      { status: 500 }
    );
  }
}
