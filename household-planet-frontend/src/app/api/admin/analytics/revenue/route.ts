import { NextRequest, NextResponse } from 'next/server';
import { secureAPI } from '@/lib/secure-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    
    const response = await secureAPI.get(`/analytics/revenue?period=${period}`, {
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
      revenue: [
        { period: 'Jan', revenue: 0 },
        { period: 'Feb', revenue: 0 },
        { period: 'Mar', revenue: 0 },
        { period: 'Apr', revenue: 0 },
        { period: 'May', revenue: 0 },
        { period: 'Jun', revenue: 0 }
      ],
      total: 0,
      growth: 0
    });
  }
}