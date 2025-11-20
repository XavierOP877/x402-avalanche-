/**
 * Proxy for x402 Facilitator /verify endpoint
 * Avoids CORS issues by proxying through Next.js API
 */

import { NextRequest, NextResponse } from 'next/server';

// Hardcode localhost facilitator URL for server-side
const FACILITATOR_URL = 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${FACILITATOR_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Facilitator responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Facilitator /verify error:', error);
    return NextResponse.json(
      { 
        isValid: false,
        invalidReason: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 503 }
    );
  }
}
