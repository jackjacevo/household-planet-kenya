import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function GET(request: NextRequest) {
  try {
    const timestamp = Date.now();
    const response = await fetch(`${API_BASE_URL}/simple-delivery/locations?t=${timestamp}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Delivery locations API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch delivery locations', data: [] },
      { status: 500 }
    );
  }
}
