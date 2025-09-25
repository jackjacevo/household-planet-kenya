import { NextRequest, NextResponse } from 'next/server';
import { secureAPI } from '@/lib/secure-api';

export async function GET(request: NextRequest) {
  try {
    const response = await secureAPI.get('/customers/insights', {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json({
      totalCustomers: 0,
      newCustomers: 0,
      activeCustomers: 0,
      customerGrowth: 0
    });
  }
}