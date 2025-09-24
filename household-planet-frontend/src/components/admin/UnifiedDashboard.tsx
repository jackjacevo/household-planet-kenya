/**
 * Unified Dashboard Component
 * Enhanced dashboard with optimized data fetching, better caching, and performance monitoring
 * Feature-flagged for safe rollout as part of Phase 3
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Bell,
  ArrowRight,
  Activity,
  Clock,
  Star,
  Boxes,
  BarChart3,
  PieChart,
  Zap,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnifiedDashboard, useDashboardPreloader, useDashboardPerformance } from '@/lib/services/unified-dashboard';
import { isFeatureEnabled, debugLog } from '@/lib/config/admin-config';
import { LoadingState, StatusLoading, StatusType, LoadingType, LoadingSize } from '@/components/ui/LoadingStates';
import { SimpleLineChart, SimplePieChart, SimpleBarChart, CustomerGrowthChart } from '@/components/admin/SimpleChart';

interface UnifiedDashboardProps {
  fallbackComponent?: React.ComponentType;
}

const PerformanceIndicator: React.FC = () => {
  const { getPerformanceMetrics } = useDashboardPerformance();
  const [metrics, setMetrics] = useState(getPerformanceMetrics());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getPerformanceMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, [getPerformanceMetrics]);

  if (!isFeatureEnabled('advancedCaching')) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-lg border border-gray-200 p-3"
      >
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          <Gauge className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-medium">
            Cache: {Math.round(metrics.cacheHitRate * 100)}%
          </span>
          <div className={`w-2 h-2 rounded-full ${
            metrics.cacheHitRate > 0.8 ? 'bg-green-500' :
            metrics.cacheHitRate > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 pt-2 border-t text-xs text-gray-600"
            >
              <div>Active: {metrics.activeQueries}</div>
              <div>Cached: {metrics.cachedQueries}</div>
              <div>Errors: {metrics.errorQueries}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const StatCard: React.FC<{
  name: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  delay?: number;
}> = ({ name, value, change, changeType, icon: Icon, color, bgColor, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-md ${bgColor}`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {name}
              </dt>
              <dd className="flex flex-col gap-1">
                <div className="text-3xl font-bold text-gray-900">
                  {value}
                </div>
                {change && (
                  <div className={`flex items-baseline text-sm font-semibold ${
                    changeType === 'increase' ? 'text-green-600' :
                    changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {changeType === 'increase' ? (
                      <TrendingUp className="self-center flex-shrink-0 h-4 w-4" />
                    ) : changeType === 'decrease' ? (
                      <TrendingDown className="self-center flex-shrink-0 h-4 w-4" />
                    ) : null}
                    <span className="ml-1">{change}</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ChartCard: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  gradient: string;
  delay?: number;
}> = ({ title, icon: Icon, children, gradient, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className={`bg-gradient-to-br ${gradient} shadow-lg rounded-xl border border-opacity-20`}
    >
      <div className="px-6 py-4 border-b border-white border-opacity-20 bg-gradient-to-r from-black from-opacity-10 to-transparent rounded-t-xl">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <Icon className="h-5 w-5 mr-2" />
          {title}
        </h2>
      </div>
      <div className="p-4" style={{height: '250px'}}>
        {children}
      </div>
    </motion.div>
  );
};

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ fallbackComponent: FallbackComponent }) => {
  const { data: stats, isLoading, error, isFetching } = useUnifiedDashboard();
  const { preloadDashboardData } = useDashboardPreloader();

  useEffect(() => {
    // Preload data in the background
    preloadDashboardData();
  }, [preloadDashboardData]);

  // Use enhanced loading states if available
  const LoadingComponent = isFeatureEnabled('improvedLoading') ? (
    <StatusLoading
      status={StatusType.LOADING}
      message="Loading dashboard data..."
      size={LoadingSize.LARGE}
      className="min-h-[200px] flex items-center justify-center"
    />
  ) : (
    <LoadingState
      type="default"
      message="Loading dashboard..."
      size="lg"
    />
  );

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          {LoadingComponent}
        </div>
      </div>
    );
  }

  if (error) {
    // Fallback to legacy component if unified fails
    if (FallbackComponent) {
      debugLog('Unified dashboard failed, falling back to legacy component');
      return <FallbackComponent />;
    }

    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <StatusLoading
          status={StatusType.ERROR}
          message="Failed to load dashboard data"
          className="min-h-[200px] flex items-center justify-center"
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <StatusLoading
          status={StatusType.WARNING}
          message="No dashboard data available"
          className="min-h-[200px] flex items-center justify-center"
        />
      </div>
    );
  }

  const statCards = [
    {
      name: 'Revenue',
      value: `KSh ${(stats.overview?.totalRevenue || 0).toLocaleString()}`,
      change: stats.overview?.revenueChange || 'N/A',
      changeType: stats.overview?.revenueChangeType || 'neutral',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Orders',
      value: (stats.overview?.totalOrders || 0).toLocaleString(),
      change: stats.overview?.ordersChange || 'N/A',
      changeType: stats.overview?.ordersChangeType || 'neutral',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Total Customers',
      value: (stats.overview?.totalCustomers || 0).toLocaleString(),
      change: stats.overview?.customersChange || 'N/A',
      changeType: stats.overview?.customersChangeType || 'neutral',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Total Products',
      value: (stats.overview?.totalProducts || 0).toLocaleString(),
      change: stats.overview?.productsChange || 'N/A',
      changeType: stats.overview?.productsChangeType || 'neutral',
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
      icon: Activity,
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
      {/* Performance Indicator (only in advanced mode) */}
      <PerformanceIndicator />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {(() => {
                const hour = new Date().getHours();
                if (hour < 12) return '🌅 Good Morning! Dashboard Overview';
                if (hour < 17) return '☀️ Good Afternoon! Dashboard Overview';
                return '🌙 Good Evening! Dashboard Overview';
              })()}
              {isFeatureEnabled('unifiedDashboard') && (
                <Zap className="h-5 w-5 text-blue-500" />
              )}
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              {isFeatureEnabled('unifiedDashboard')
                ? 'Enhanced dashboard with optimized performance and real-time insights.'
                : 'Welcome to your admin dashboard. Here\'s what\'s happening with your store today.'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isFetching ? 'bg-blue-500' : 'bg-green-500'}`}></div>
            <span>{isFetching ? 'Updating...' : 'Live data'}</span>
          </div>
        </div>
      </motion.div>

      {/* New Orders Alert */}
      {(stats.overview?.pendingOrders || 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg border border-orange-300"
        >
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    <Bell className="h-6 w-6 text-white animate-bounce" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">
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
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-600 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                >
                  View Orders
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((item, index) => (
          <StatCard
            key={item.name}
            name={item.name}
            value={item.value}
            change={item.change}
            changeType={item.changeType as any}
            icon={item.icon}
            color={item.color}
            bgColor={item.bgColor}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <ChartCard
          title="Revenue Trend"
          icon={BarChart3}
          gradient="from-blue-50 to-indigo-100"
          delay={0.2}
        >
          <SimpleLineChart />
        </ChartCard>

        <ChartCard
          title="Popular Categories"
          icon={PieChart}
          gradient="from-purple-50 to-pink-100"
          delay={0.3}
        >
          <SimplePieChart />
        </ChartCard>

        <ChartCard
          title="Monthly Orders"
          icon={Activity}
          gradient="from-green-50 to-emerald-100"
          delay={0.4}
        >
          <SimpleBarChart />
        </ChartCard>

        <ChartCard
          title="Customer Growth"
          icon={Users}
          gradient="from-violet-50 to-purple-100"
          delay={0.5}
        >
          <CustomerGrowthChart customerGrowth={stats.customerGrowth || []} />
        </ChartCard>
      </div>

      {/* Rest of the dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg rounded-xl border border-yellow-200"
        >
          <div className="px-6 py-4 border-b border-yellow-200 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-t-xl">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Recent Orders
            </h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
            {Array.isArray(stats.recentOrders) && stats.recentOrders.length > 0 ? stats.recentOrders.slice(0, 5).map((order: any) => (
              <div key={order.id} className="px-6 py-4 hover:bg-yellow-25 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      #{order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{order.user?.name || 'Guest Customer'}</p>
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
            )) : (
              <div className="px-4 py-8 text-center text-gray-500">
                No recent orders
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-pink-50 to-rose-50 shadow-lg rounded-xl border border-pink-200"
        >
          <div className="px-6 py-4 border-b border-pink-200 bg-gradient-to-r from-pink-600 to-rose-600 rounded-t-xl">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Top Selling Products
            </h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
            {Array.isArray(stats.topProducts) && stats.topProducts.length > 0 ? stats.topProducts.map((product: any) => (
              <div key={product.id} className="px-6 py-4 hover:bg-pink-25 transition-colors">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded object-cover"
                      src={'/images/products/placeholder.svg'}
                      alt={product.name}
                    />
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">KSh {product.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-medium text-gray-900">
                      {product.totalSold} sold
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="px-4 py-8 text-center text-gray-500">
                No top products
              </div>
            )}
          </div>
        </motion.div>

        {/* Sales by County */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg rounded-xl border border-indigo-200"
        >
          <div className="px-6 py-4 border-b border-indigo-200 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-xl">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Sales by County
            </h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
            {Array.isArray(stats.salesByCounty) && stats.salesByCounty.length > 0 ? stats.salesByCounty.slice(0, 5).map((county: any) => (
              <div key={county.county} className="px-6 py-4 hover:bg-indigo-25 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {county.county}
                    </p>
                    <p className="text-sm text-gray-500">
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
            )) : (
              <div className="px-4 py-8 text-center text-gray-500">
                No sales data
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;