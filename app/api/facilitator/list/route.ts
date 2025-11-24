/**
 * GET /api/facilitator/list
 *
 * Returns list of all active facilitators for user selection
 */

import { NextResponse } from 'next/server';
import { getActiveFacilitators } from '@/lib/facilitator-db';

export async function GET() {
  try {
    const facilitators = await getActiveFacilitators();

    return NextResponse.json({
      success: true,
      facilitators,
      count: facilitators.length,
    });
  } catch (error) {
    console.error('Failed to fetch facilitators:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch facilitators',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
