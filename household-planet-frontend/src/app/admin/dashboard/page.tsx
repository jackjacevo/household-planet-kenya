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
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Star,
  Boxes,
  Bell,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { SimpleLineChart, SimplePieChart, SimpleBarChart, CustomerGrowthChart } from '@/components/admin/SimpleChart';

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
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    const response = await axios.get(
      `${apiUrl}/api/admin/dashboard`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return (response as any).data;
  };

  const { data: stats, isLoading: loading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000,
    retry: (failureCount, error: any) => {
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

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading dashboard
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Unable to load dashboard data. Please try refreshing the page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return <div>Loading dashboard...</div>;

  const statCards = [
    {
      name: 'Revenue',
      value: `KSh ${(stats.overview?.totalRevenue || 0).toLocaleString()}`,
      subValue: `Total: KSh ${(stats.overview?.totalRevenue || 0).toLocaleString()}`,
      change: '+12.5%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Orders',
      value: (stats.overview?.totalOrders || 0).toLocaleString(),
      change: '+8.2%',
      changeType: 'increase',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Total Customers',
      value: (stats.overview?.totalCustomers || 0).toLocaleString(),
      change: '+15.3%',
      changeType: 'increase',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Total Products',
      value: (stats.overview?.totalProducts || 0).toLocaleString(),
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
      value: stats.overview?.todayOrders || 0,
      icon: ShoppingCart,
    },
    {
      name: "Today's Revenue",
      value: `KSh ${(stats.overview?.todayRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
    },
    {
      name: 'Pending Orders',
      value: stats.overview?.pendingOrders || 0,
      icon: Bell,
    },
    {
      name: 'Low Stock Alerts',
      value: stats.overview?.lowStockProducts || 0,
      icon: AlertTriangle,
    },
  ];

  const productStats = [
    {
      name: 'Total Products',
      value: stats.overview?.totalProducts || 0,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      name: 'Active Products',
      value: stats.overview?.activeProducts || 0,
      icon: Eye,
      color: 'text-green-600'
    },
    {
      name: 'Low Stock',
      value: stats.overview?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'text-yellow-600'
    },
    {
      name: 'Out of Stock',
      value: stats.overview?.outOfStockProducts || 0,
      icon: AlertTriangle,
      color: 'text-red-600'
    },
  ];

  return (
    <div className="px-2 sm:px-4 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="mt-1 sm:mt-2 text-sm text-gray-700">
              Welcome to your admin dashboard. Here's what's happening with your store today.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="hidden sm:inline">Live updates every 30s</span>
            <span className="sm:hidden">Live updates</span>
          </div>
        </div>
      </div>

      {/* New Orders Alert */}
      {(stats.overview?.pendingOrders || 0) > 0 && (
        <div className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg border border-orange-300">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-white animate-bounce" />
                  </div>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    {stats.overview?.pendingOrders || 0} New Order{(stats.overview?.pendingOrders || 0) !== 1 ? 's' : ''} Pending
                  </h3>
                  <p className="text-sm text-orange-100">
                    {(stats.overview?.pendingOrders || 0) === 1 ? 'You have a new order' : `You have ${stats.overview?.pendingOrders || 0} new orders`} waiting for processing
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button 
                  onClick={() => window.location.href = '/admin/orders'}
                  className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-600 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                >
                  <span className="hidden sm:inline">View Orders</span>
                  <span className="sm:hidden">View</span>
                  <ArrowRight className="ml-1 sm:ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-4 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-2 sm:p-3 rounded-md ${item.bgColor}`}>
                    <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${item.color}`} />
                  </div>
                </div>
                <div className="ml-3 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-0">
                      <div className="text-lg sm:text-2xl font-semibold text-gray-900">
                        {item.value}
                      </div>
                      {item.subValue && (
                        <div className="text-xs text-gray-500 hidden sm:block">
                          {item.subValue}
                        </div>
                      )}
                      <div className={`flex items-baseline text-xs sm:text-sm font-semibold sm:ml-2 ${
                        item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.changeType === 'increase' ? (
                          <TrendingUp className="self-center flex-shrink-0 h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <TrendingDown className="self-center flex-shrink-0 h-3 w-3 sm:h-4 sm:w-4" />
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg rounded-xl border border-blue-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Revenue Trend</span>
              <span className="sm:hidden">Revenue</span>
            </h2>
          </div>
          <div className="p-3 sm:p-4" style={{height: '250px'}}>
            <SimpleLineChart />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-100 shadow-lg rounded-xl border border-purple-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-200 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-xl">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
              <PieChart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Popular Categories</span>
              <span className="sm:hidden">Categories</span>
            </h2>
          </div>
          <div className="p-3 sm:p-4" style={{height: '250px'}}>
            <SimplePieChart />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 shadow-lg rounded-xl border border-green-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-green-200 bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-xl">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Monthly Orders</span>
              <span className="sm:hidden">Orders</span>
            </h2>
          </div>
          <div className="p-3 sm:p-4" style={{height: '250px'}}>
            <SimpleBarChart />
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-purple-100 shadow-lg rounded-xl border border-violet-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-violet-200 bg-gradient-to-r from-violet-600 to-purple-600 rounded-t-xl">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Customer Growth</span>
              <span className="sm:hidden">Growth</span>
            </h2>
          </div>
          <div className="p-3 sm:p-4" style={{height: '250px'}}>
            <CustomerGrowthChart customerGrowth={stats.customerGrowth || []} />
          </div>
        </div>
      </div>

      {/* Product Stats */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 shadow-lg rounded-xl border border-orange-200 mb-6 sm:mb-8">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-orange-200 bg-gradient-to-r from-orange-600 to-red-600 rounded-t-xl">
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
            <Boxes className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="hidden sm:inline">Product Overview</span>
            <span className="sm:hidden">Products</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-orange-200">
          {productStats.map((stat, index) => (
            <div key={stat.name} className="px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                <div className="p-2 rounded-lg bg-white shadow-sm w-fit">
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
                <div className="sm:ml-3">
                  <p className="text-xs sm:text-sm text-orange-700 font-medium truncate">{stat.name}</p>
                  <p className="text-lg sm:text-xl font-bold text-orange-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Stats */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 shadow-lg rounded-xl border border-cyan-200 mb-6 sm:mb-8">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-cyan-200 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-t-xl">
          <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="hidden sm:inline">Today's Performance</span>
            <span className="sm:hidden">Today</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-cyan-200">
          {todayStats.map((stat, index) => (
            <div key={stat.name} className="px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                <div className="p-2 rounded-lg bg-white shadow-sm w-fit">
                  <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600" />
                </div>
                <div className="sm:ml-3">
                  <p className="text-xs sm:text-sm text-cyan-700 font-medium truncate">{stat.name}</p>
                  <p className="text-lg sm:text-xl font-bold text-cyan-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Orders */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg rounded-xl border border-yellow-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-yellow-200 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-t-xl">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Recent Orders</span>
              <span className="sm:hidden">Orders</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
            {(stats.recentOrders || []).slice(0, 5).map((order: any) => (
              <div key={order.id} className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      #{order.orderNumber}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{(order as any).user?.name || 'Guest Customer'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right ml-2">
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
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg rounded-xl border border-pink-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-pink-200 bg-gradient-to-r from-pink-600 to-rose-600 rounded-t-xl">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Top Selling Products</span>
              <span className="sm:hidden">Top Products</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
            {(stats.topProducts || []).map((product: any) => (
              <div key={product.id} className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                    <img
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded object-cover"
                      src={(product.images && product.images.length > 0 && product.images[0] && !product.images[0].includes('[')) ? product.images[0] : '/images/products/placeholder.svg'}
                      alt={product.name}
                      onError={(e) => { e.currentTarget.src = '/images/products/placeholder.svg'; }}
                    />
                  </div>
                  <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">KSh {product.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-medium text-gray-900">
                      {product.totalSold} sold
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by County */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg rounded-xl border border-indigo-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-indigo-200 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-xl">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">Sales by County</span>
              <span className="sm:hidden">Counties</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
            {stats.salesByCounty?.slice(0, 5).map((county: any, index: number) => (
              <div key={county.county} className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {county.county}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {county.orders} orders
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-medium text-gray-900">
                      KSh {county.revenue.toLocaleString()}
                    </p>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (county.revenue / Math.max(...(stats.salesByCounty?.map((c: any) => c.revenue) || [1]))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}
