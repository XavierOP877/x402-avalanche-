/**
 * GET /api/facilitator/my?address=0x...
 *
 * Get user's own facilitator
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFacilitatorByOwner } from '@/lib/facilitator-db';
import { toPublicInfo } from '@/lib/facilitator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Missing address parameter' },
        { status: 400 }
      );
    }

    const facilitator = await getFacilitatorByOwner(address);

    if (!facilitator) {
      return NextResponse.json({
        success: true,
        facilitator: null,
        message: 'No facilitator found for this address'
      });
    }

    // Return public info + gas wallet address (but not private key)
    return NextResponse.json({
      success: true,
      facilitator: {
        ...toPublicInfo(facilitator),
        facilitatorWalletAddress: facilitator.facilitatorWalletAddress,
        description: facilitator.description,
      }
    });
  } catch (error) {
    console.error('Failed to fetch user facilitator:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch facilitator',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
