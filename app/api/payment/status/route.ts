/**
 * Payment Status API Route
 *
 * Checks if a payment has been verified and grants access
 * Simplified: Just validates the payment proof can be decoded
 */

import { NextRequest, NextResponse } from 'next/server';
import { decodePaymentHeader, X402_CONFIG } from '@/lib/x402';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentHeader } = body;

    if (!paymentHeader) {
      return NextResponse.json(
        { error: 'Missing payment header', verified: false },
        { status: 200 }
      );
    }

    // Decode and validate payment proof
    const paymentPayload = decodePaymentHeader(paymentHeader);

    // Basic validation
    if (!paymentPayload || !paymentPayload.payload) {
      return NextResponse.json(
        { error: 'Invalid payment proof format', verified: false },
        { status: 200 }
      );
    }

    const payload = paymentPayload.payload;

    // Validate payment details match expected values
    const expectedAmount = (BigInt(1000000)).toString(); // 1 USDC
    const validPayment =
      payload.amount === expectedAmount &&
      paymentPayload.network === X402_CONFIG.NETWORK &&
      paymentPayload.scheme === 'exact';

    if (!validPayment) {
      return NextResponse.json(
        { error: 'Payment details do not match requirements', verified: false },
        { status: 200 }
      );
    }

    console.log('✅ Payment verified:', {
      from: payload.from,
      to: payload.to,
      amount: payload.amount,
      network: paymentPayload.network,
    });

    return NextResponse.json({
      verified: true,
      payment: {
        from: payload.from,
        to: payload.to,
        amount: payload.amount,
        network: paymentPayload.network,
      },
    });
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check payment status',
        message: error instanceof Error ? error.message : 'Unknown error',
        verified: false,
      },
      { status: 200 }
    );
  }
}
