/**
 * Payment Status API Route
 *
 * Checks if a payment has been verified and grants access
 * Validates ERC-3009 payment proofs
 */

import { NextRequest, NextResponse } from 'next/server';
import { decodePaymentHeader, X402_CONFIG } from '@/lib/x402';
import { parseUnits } from 'viem';

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

    // Check if this is an ERC-3009 authorization (has signature and authorization fields)
    const isERC3009 = 'authorization' in payload && 'signature' in payload;

    let from: string, to: string, amount: string;

    if (isERC3009) {
      // ERC-3009 authorization payload
      const auth = (payload as any).authorization;
      from = auth.from;
      to = auth.to;
      amount = auth.value; // Already in atomic units (string)
    } else {
      // Simple payload
      from = (payload as any).from;
      to = (payload as any).to;
      amount = (payload as any).amount;
    }

    // Validate payment details match expected values
    const expectedAmount = parseUnits(X402_CONFIG.PAYMENT_AMOUNT, X402_CONFIG.USDC_DECIMALS).toString();
    const validPayment =
      amount === expectedAmount &&
      to === X402_CONFIG.PAYMENT_RECIPIENT &&
      paymentPayload.network === X402_CONFIG.NETWORK &&
      paymentPayload.scheme === 'exact';

    if (!validPayment) {
      console.error('❌ Payment validation failed:', {
        expectedAmount,
        actualAmount: amount,
        expectedRecipient: X402_CONFIG.PAYMENT_RECIPIENT,
        actualRecipient: to,
        expectedNetwork: X402_CONFIG.NETWORK,
        actualNetwork: paymentPayload.network,
      });
      return NextResponse.json(
        { error: 'Payment details do not match requirements', verified: false },
        { status: 200 }
      );
    }

    console.log('✅ Payment verified:', {
      from,
      to,
      amount,
      network: paymentPayload.network,
      type: isERC3009 ? 'ERC-3009' : 'Simple',
    });

    return NextResponse.json({
      verified: true,
      payment: {
        from,
        to,
        amount,
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
