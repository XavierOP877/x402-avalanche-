/**
 * GET /api/facilitator/balance?address=0x...
 *
 * Check AVAX balance of a facilitator wallet
 * Used to determine if facilitator is funded and ready
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, formatEther } from 'viem';
import { avalancheFuji } from 'viem/chains';

const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(process.env.RPC_URL_AVALANCHE_FUJI || 'https://api.avax-test.network/ext/bc/C/rpc'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Missing address parameter' },
        { status: 400 }
      );
    }

    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Get AVAX balance
    const balance = await publicClient.getBalance({
      address: address as `0x${string}`,
    });

    const balanceInAvax = formatEther(balance);
    const isFunded = parseFloat(balanceInAvax) >= 0.1; // Need at least 0.1 AVAX

    return NextResponse.json({
      success: true,
      address,
      balance: balanceInAvax,
      balanceWei: balance.toString(),
      isFunded,
      minimumRequired: '0.1',
    });
  } catch (error) {
    console.error('❌ Error checking balance:', error);
    return NextResponse.json(
      { error: 'Failed to check balance' },
      { status: 500 }
    );
  }
}
