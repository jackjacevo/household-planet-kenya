import { NextRequest, NextResponse } from 'next/server';
import { secureAPI } from '@/lib/secure-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    
    const response = await secureAPI.get(`/categories/popular?period=${period}`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    if (error.response?.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json({
      categories: [
        { name: 'Kitchen', count: 0 },
        { name: 'Cleaning', count: 0 },
        { name: 'Storage', count: 0 }
      ]
    });
  }
}