import { NextRequest, NextResponse } from 'next/server';
import { secureAPI } from '@/lib/secure-api';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await secureAPI.get(`/customers/${params.id}/details`, {
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
      id: parseInt(params.id),
      name: 'Customer',
      email: 'customer@example.com',
      phone: '',
      createdAt: new Date().toISOString(),
      customerProfile: {
        totalSpent: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        tags: []
      },
      orders: [],
      addresses: []
    });
  }
}