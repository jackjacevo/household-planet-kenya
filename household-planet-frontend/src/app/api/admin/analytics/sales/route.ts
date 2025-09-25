import { NextRequest, NextResponse } from 'next/server';
import { secureAPI } from '@/lib/secure-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    
    const response = await secureAPI.get(`/analytics/sales?period=${period}`, {
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
      sales: [
        { period: 'Jan', orders: 0, revenue: 0 },
        { period: 'Feb', orders: 0, revenue: 0 },
        { period: 'Mar', orders: 0, revenue: 0 },
        { period: 'Apr', orders: 0, revenue: 0 },
        { period: 'May', orders: 0, revenue: 0 },
        { period: 'Jun', orders: 0, revenue: 0 }
      ],
      total: 0,
      growth: 0
    });
  }
}