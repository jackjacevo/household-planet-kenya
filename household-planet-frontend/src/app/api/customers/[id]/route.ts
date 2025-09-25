import { NextRequest, NextResponse } from 'next/server';
import { secureAPI } from '@/lib/secure-api';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    const response = await secureAPI.delete(`/customers/${id}`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    if (error.response?.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json({ success: true });
  }
}