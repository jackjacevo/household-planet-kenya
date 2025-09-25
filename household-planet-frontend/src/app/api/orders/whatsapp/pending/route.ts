import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://householdplanetkenya.co.ke';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const backendUrl = `${BACKEND_URL}/api/orders/whatsapp/pending?${searchParams.toString()}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('WhatsApp pending orders API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WhatsApp pending orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}