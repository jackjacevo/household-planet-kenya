import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.householdplanetkenya.co.ke';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const backendUrl = `${BACKEND_URL}/dashboard?${searchParams.toString()}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        })
      },
    });

    if (!response.ok) {
      console.warn(`Backend API error: ${response.status}, falling back to mock data`);
      // Return mock data if backend fails
      return NextResponse.json({
        overview: {
          totalOrders: 0,
          totalRevenue: 0,
          totalCustomers: 0,
          totalProducts: 0,
          activeProducts: 0,
          outOfStockProducts: 0,
          todayOrders: 0,
          todayRevenue: 0,
          pendingOrders: 0,
          lowStockProducts: 0,
          deliveredRevenue: 0
        },
        recentOrders: [],
        topProducts: [],
        customerGrowth: [],
        salesByCounty: []
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin dashboard API error:', error);
    // Return mock data on error
    return NextResponse.json({
      overview: {
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        activeProducts: 0,
        outOfStockProducts: 0,
        todayOrders: 0,
        todayRevenue: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        deliveredRevenue: 0
      },
      recentOrders: [],
      topProducts: [],
      customerGrowth: [],
      salesByCounty: []
    });
  }
}