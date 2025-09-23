import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://api.householdplanetkenya.co.ke';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Forward the request to the backend
    const backendUrl = `${BACKEND_URL}/products?${searchParams.toString()}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
    });

    if (!response.ok) {
      // If backend is not available, return mock data for development
      const mockProducts = {
        data: [],
        total: 0,
        page: 1,
        limit: parseInt(searchParams.get('limit') || '10'),
        totalPages: 0
      };

      return NextResponse.json(mockProducts, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Products API error:', error);

    // Return mock data if there's an error
    const mockProducts = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    };

    return NextResponse.json(mockProducts, { status: 200 });
  }
}