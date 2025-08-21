import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    try {
      const response = await fetch(`${API_BASE_URL}/gdpr/cookie-consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify(body),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000),
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch (fetchError) {
      // If backend is not available, return success anyway since preferences are saved locally
      console.warn('Backend not available for cookie consent:', fetchError);
      return NextResponse.json(
        { success: true, message: 'Cookie preferences saved locally' },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update cookie consent' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    try {
      const response = await fetch(`${API_BASE_URL}/gdpr/cookie-consent`, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
        signal: AbortSignal.timeout(5000),
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch (fetchError) {
      // Return default preferences if backend is not available
      console.warn('Backend not available for cookie consent:', fetchError);
      return NextResponse.json({
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false,
      }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cookie consent' },
      { status: 500 }
    );
  }
}