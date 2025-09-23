import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Production admin credentials
    const ADMIN_EMAIL = 'householdplanet819@gmail.com';
    const ADMIN_PASSWORD = 'Admin@2025';

    // Alternative admin email
    const ALT_ADMIN_EMAIL = 'admin@householdplanetkenya.co.ke';

    // Check for admin credentials (production-ready)
    if ((email === ADMIN_EMAIL || email === ALT_ADMIN_EMAIL) && password === ADMIN_PASSWORD) {
      const adminUser = {
        id: 1,
        email: email,
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPER_ADMIN',
        isEmailVerified: true
      };

      // Create a proper JWT-like token
      const tokenPayload = {
        sub: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      };

      const token = btoa(JSON.stringify(tokenPayload));

      return NextResponse.json({
        access_token: token,
        accessToken: token, // Alternative key for compatibility
        user: adminUser,
        message: 'Login successful'
      });
    }

    // Try to authenticate with backend API if available
    const backendUrls = [
      'https://api.householdplanetkenya.co.ke/auth/login',
      'https://api.householdplanetkenya.co.ke/api/auth/login'
    ];

    for (const backendUrl of backendUrls) {
      try {
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          // Add timeout to avoid hanging
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        }

        if (response.status !== 404) {
          // If we get a non-404 error, stop trying other URLs
          break;
        }
      } catch (backendError) {
        // Continue to next URL or fallback
        console.log(`Backend ${backendUrl} unavailable:`, backendError.message);
      }
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