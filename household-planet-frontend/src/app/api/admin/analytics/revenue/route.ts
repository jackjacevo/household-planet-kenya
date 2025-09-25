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
    console.error('Analytics revenue API error:', error.response?.data || error.message);
    
    return NextResponse.json({
      revenue: [
        { period: 'Jan', amount: 0 },
        { period: 'Feb', amount: 0 },
        { period: 'Mar', amount: 0 },
        { period: 'Apr', amount: 0 },
        { period: 'May', amount: 0 },
        { period: 'Jun', amount: 0 }
      ],
      total: 0,
      growth: 0
    });
  }
}