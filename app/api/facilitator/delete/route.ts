/**
 * DELETE /api/facilitator/delete
 *
 * Delete a facilitator by ID
 * Only the creator can delete their facilitator
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFacilitator, deleteFacilitator } from '@/lib/facilitator-storage';
import { logEvent } from '@/lib/explorer-logging';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { facilitatorId, userAddress } = body;

    if (!facilitatorId || !userAddress) {
      return NextResponse.json(
        { error: 'Missing facilitator ID or user address' },
        { status: 400 }
      );
    }

    // Get facilitator to verify ownership
    const facilitator = await getFacilitator(facilitatorId);
    if (!facilitator) {
      return NextResponse.json(
        { error: 'Facilitator not found' },
        { status: 404 }
      );
    }

    // Verify the user is the creator
    if (facilitator.createdBy.toLowerCase() !== userAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'You can only delete facilitators you created' },
        { status: 403 }
      );
    }

    // Delete the facilitator
    await deleteFacilitator(facilitatorId);

    // Log deletion event
    await logEvent({
      eventType: 'status_changed',
      facilitatorId: facilitator.id,
      facilitatorName: facilitator.name,
      status: 'success',
    });

    console.log(`✅ Deleted facilitator: ${facilitatorId} by ${userAddress}`);

    return NextResponse.json({
      success: true,
      message: 'Facilitator deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting facilitator:', error);
    return NextResponse.json(
      { error: 'Failed to delete facilitator' },
      { status: 500 }
    );
  }
}
