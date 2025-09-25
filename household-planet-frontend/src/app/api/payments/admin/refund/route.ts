import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.householdplanetkenya.co.ke';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Remove duplicate /api - BACKEND_URL already includes /api
    const baseUrl = BACKEND_URL.endsWith('/api') ? BACKEND_URL : `${BACKEND_URL}/api`;
    const backendUrl = `${baseUrl}/payments/admin/refund`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Payment refund API error:', error);
    return NextResponse.json(
      { error: 'Failed to process refund', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}