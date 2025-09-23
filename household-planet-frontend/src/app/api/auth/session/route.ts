import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/sessions`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to get sessions' }, { status: response.status });
    }

    const sessions = await response.json();
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ error: 'Session check failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/logout-all`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to logout all sessions' }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}