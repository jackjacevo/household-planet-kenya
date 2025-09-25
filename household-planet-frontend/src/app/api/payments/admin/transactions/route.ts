import { NextRequest, NextResponse } from 'next/server';
import { secureAPI } from '@/lib/secure-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    const response = await secureAPI.get(`/payments/admin/transactions?${params.toString()}`, {
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
      transactions: [],
      total: 0
    });
  }
}