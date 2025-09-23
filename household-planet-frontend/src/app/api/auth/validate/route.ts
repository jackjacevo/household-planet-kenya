import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await response.json();
    return NextResponse.json({ valid: true, user });
  } catch {
    return NextResponse.json({ error: 'Token validation failed' }, { status: 401 });
  }
}