import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Decode the token (basic validation for our mock token)
    try {
      const payload = JSON.parse(atob(token));

      // Check if token has expired
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return NextResponse.json({ error: 'Token expired' }, { status: 401 });
      }

      // For our admin token, return success
      if (payload.email === 'householdplanet819@gmail.com' && payload.role === 'ADMIN') {
        return NextResponse.json({ valid: true });
      }
    } catch (decodeError) {
      // If token is not our format, try backend validation
    }

    // Try backend validation as fallback
    try {
      const backendUrl = `${process.env.BACKEND_URL || 'https://api.householdplanetkenya.co.ke'}/auth/profile`;
      const response = await fetch(backendUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const user = await response.json();
        return NextResponse.json({ valid: true, user });
      }
    } catch (backendError) {
      // Backend unavailable
    }

    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Token validation failed' }, { status: 401 });
  }
}