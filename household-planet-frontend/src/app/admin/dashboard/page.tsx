'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  Calendar
} from 'lucide-react';
import axios from 'axios';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';

interface DashboardStats {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
    todayOrders: number;
    todayRevenue: number;
    pendingOrders: number;
    lowStockProducts: number;
  };
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
    orderItems: Array<{ product: { name: string } }>;
  }>;
  topProducts: Array<{
    id: number;
    name: string;
    price: number;
    totalSold: number;
    images: string[];
  }>;
  customerGrowth: Array<{
    month: string;
    customers: number;
  }>;
  salesByCounty: Array<{
    county: string;
    revenue: number;
    orders: number;
  }>;
}

export default function AdminDashboard() {
  const { refreshAll } = useRealtimeOrders();
  
  const fetchDashboardStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
  };

  const { data: stats, isLoading: loading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000,
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return false;
      }
      return failureCount < 3;
    }
  });

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return <div>Error loading dashboard</div>;

  const statCards = [
    {
      name: 'Total Revenue',
      value: `KSh ${(stats.overview.totalRevenue || 0).toLocaleString()}`,
      change: '+12.5%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Orders',
      value: (stats.overview.totalOrders || 0).toLocaleString(),
      change: '+8.2%',
      changeType: 'increase',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Total Customers',
      value: (stats.overview.totalCustomers || 0).toLocaleString(),
      change: '+15.3%',
      changeType: 'increase',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Total Products',
      value: (stats.overview.totalProducts || 0).toLocaleString(),
      change: '+2.1%',
      changeType: 'increase',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const todayStats = [
    {
      name: "Today's Orders",
      value: stats.overview.todayOrders,
      icon: ShoppingCart,
    },
    {
      name: "Today's Revenue",
      value: `KSh ${(stats.overview.todayRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
    },
    {
      name: 'Pending Orders',
      value: stats.overview.pendingOrders,
      icon: Calendar,
    },
    {
      name: 'Low Stock Alerts',
      value: stats.overview.lowStockProducts,
      icon: AlertTriangle,
    },
  ];

  const productStats = [
    {
      name: 'Total Products',
      value: stats.overview.totalProducts,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      name: 'Active Products',
      value: stats.overview.activeProducts,
      icon: Eye,
      color: 'text-green-600'
    },
    {
      name: 'Low Stock',
      value: stats.overview.lowStockProducts,
      icon: AlertTriangle,
      color: 'text-yellow-600'
    },
    {
      name: 'Out of Stock',
      value: stats.overview.outOfStockProducts,
      icon: AlertTriangle,
      color: 'text-red-600'
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="mt-2 text-sm text-gray-700">
              Welcome to your admin dashboard. Here's what's happening with your store today.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live updates every 30s</span>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${item.bgColor}`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {item.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.changeType === 'increase' ? (
                          <TrendingUp className="self-center flex-shrink-0 h-4 w-4" />
                        ) : (
                          <TrendingDown className="self-center flex-shrink-0 h-4 w-4" />
                        )}
                        <span className="ml-1">{item.change}</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Stats */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Product Overview</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {productStats.map((stat, index) => (
            <div key={stat.name} className={`px-6 py-4 ${index < productStats.length - 1 ? 'border-r border-gray-200' : ''}`}>
              <div className="flex items-center">
                <stat.icon className={`h-5 w-5 mr-3 ${stat.color}`} />
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Stats */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Today's Performance</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {todayStats.map((stat, index) => (
            <div key={stat.name} className={`px-6 py-4 ${index < todayStats.length - 1 ? 'border-r border-gray-200' : ''}`}>
              <div className="flex items-center">
                <stat.icon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500">{order.user.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      KSh {order.total.toLocaleString()}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Top Selling Products</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.topProducts.map((product) => (
              <div key={product.id} className="px-6 py-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded object-cover"
                      src={product.images[0] || '/images/products/placeholder.svg'}
                      alt={product.name}
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">KSh {product.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {product.totalSold} sold
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales by County */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Sales by County</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.salesByCounty.map((county) => (
              <div key={county.county} className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900">{county.county}</h3>
                <p className="text-2xl font-bold text-gray-900">
                  KSh {county.revenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">{county.orders} orders</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}