import { NextRequest, NextResponse } from 'next/server';
import { secureAPI } from '@/lib/secure-api';

export async function GET(request: NextRequest) {
  try {
    const response = await secureAPI.get('/orders/admin/stats', {
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
      totalOrders: 0,
      totalRevenue: 0,
      deliveredRevenue: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      urgentOrders: []
    });
  }
}