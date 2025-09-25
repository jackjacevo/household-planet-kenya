import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://householdplanetkenya.co.ke';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  try {
    const { messageId } = await params;
    const body = await request.json();
    const backendUrl = `${BACKEND_URL}/api/orders/whatsapp/${messageId}/processed`;

    const response = await fetch(backendUrl, {
      method: 'PATCH',
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
    console.error('WhatsApp message processed API error:', error);
    return NextResponse.json(
      { error: 'Failed to update WhatsApp message status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}