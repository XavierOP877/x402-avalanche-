/**
 * GET /api/facilitator/list
 *
 * Get list of all active facilitators
 * Returns public info only (no private keys)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getActiveFacilitators } from '@/lib/facilitator-storage';

export async function GET(request: NextRequest) {
  try {
    const facilitators = await getActiveFacilitators();

    return NextResponse.json({
      success: true,
      facilitators,
      count: facilitators.length,
    });
  } catch (error) {
    console.error('❌ Error listing facilitators:', error);
    return NextResponse.json(
      { error: 'Failed to list facilitators' },
      { status: 500 }
    );
  }
}
