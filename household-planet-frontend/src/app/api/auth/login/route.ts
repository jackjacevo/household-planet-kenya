import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Admin credentials for development/fallback
    const ADMIN_EMAIL = 'householdplanet819@gmail.com';
    const ADMIN_PASSWORD = 'Admin@2025';

    // Check for admin credentials first (fallback)
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser = {
        id: 1,
        email: ADMIN_EMAIL,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isEmailVerified: true
      };

      const mockToken = btoa(JSON.stringify({
        sub: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      }));

      return NextResponse.json({
        access_token: mockToken,
        user: adminUser,
        message: 'Login successful'
      });
    }

    // Try to forward to backend if available
    try {
      const backendUrl = API_CONFIG.BASE_URL.startsWith('http')
        ? `${API_CONFIG.BASE_URL}/auth/login`
        : `${process.env.BACKEND_URL || 'https://api.householdplanetkenya.co.ke'}/auth/login`;

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (backendError) {
      console.log('Backend unavailable, using fallback authentication');
    }

    // Return unauthorized if credentials don't match
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}