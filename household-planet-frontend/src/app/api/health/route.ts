import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basic health check - could be extended with more checks
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'household-planet-frontend',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'household-planet-frontend',
      error: 'Health check failed'
    }, { status: 500 });
  }
}