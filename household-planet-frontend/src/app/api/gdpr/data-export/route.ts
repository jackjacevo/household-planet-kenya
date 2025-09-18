import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/gdpr/data-export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const blob = await response.blob();
      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="data-export.json"',
        },
      });
    }

    const errorData = await response.json();
    return NextResponse.json(errorData, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
