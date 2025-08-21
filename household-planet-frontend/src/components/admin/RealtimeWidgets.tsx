'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Package, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  MapPin
} from 'lucide-react';

interface RealtimeStatsProps {
  stats: {
    todayOrders: number;
    todayRevenue: number;
    pendingOrders: number;
    lowStockProducts: number;
  };
}

export function RealtimeStats({ stats }: RealtimeStatsProps) {
  const widgets = [
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: "Today's Revenue",
      value: `KSh ${stats.todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      change: '-5%',
      changeType: 'decrease'
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: '+3',
      changeType: 'increase'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {widgets.map((widget) => (
        <div key={widget.title} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${widget.bgColor}`}>
              <widget.icon className={`h-6 w-6 ${widget.color}`} />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">{widget.title}</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">{widget.value}</p>
                <div className={`ml-2 flex items-center text-sm ${
                  widget.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {widget.changeType === 'increase' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="ml-1">{widget.change}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface KPIWidgetsProps {
  kpis: {
    customerLifetimeValue: number;
    customerAcquisitionCost: number;
    inventoryTurnover: number;
    returnRate: number;
    customerSatisfaction: number;
  };
}

export function KPIWidgets({ kpis }: KPIWidgetsProps) {
  const kpiData = [
    {
      title: 'Customer Lifetime Value',
      value: `KSh ${kpis.customerLifetimeValue.toLocaleString()}`,
      description: 'Average customer value',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Customer Acquisition Cost',
      value: `KSh ${kpis.customerAcquisitionCost.toLocaleString()}`,
      description: 'Cost to acquire new customer',
      icon: DollarSign,
      color: 'text-blue-600'
    },
    {
      title: 'Inventory Turnover',
      value: `${kpis.inventoryTurnover.toFixed(1)}x`,
      description: 'Times inventory sold per period',
      icon: Package,
      color: 'text-green-600'
    },
    {
      title: 'Return Rate',
      value: `${kpis.returnRate.toFixed(1)}%`,
      description: 'Percentage of returned orders',
      icon: TrendingDown,
      color: 'text-red-600'
    },
    {
      title: 'Customer Satisfaction',
      value: `${kpis.customerSatisfaction.toFixed(1)}/5`,
      description: 'Average review rating',
      icon: Star,
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Key Performance Indicators</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiData.map((kpi) => (
            <div key={kpi.title} className="text-center">
              <div className="flex justify-center mb-2">
                <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
              <p className="text-xs text-gray-500">{kpi.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ActivityFeedProps {
  activities: {
    recentOrders: Array<{
      type: string;
      message: string;
      timestamp: string;
      amount?: number;
    }>;
    newCustomers: Array<{
      type: string;
      message: string;
      timestamp: string;
    }>;
    newReviews: Array<{
      type: string;
      message: string;
      timestamp: string;
    }>;
    lowStockAlerts: Array<{
      type: string;
      message: string;
      timestamp: string;
    }>;
  };
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const allActivities = [
    ...activities.recentOrders,
    ...activities.newCustomers,
    ...activities.newReviews,
    ...activities.lowStockAlerts
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4 text-blue-600" />;
      case 'customer':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'review':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100';
      case 'customer':
        return 'bg-green-100';
      case 'review':
        return 'bg-yellow-100';
      case 'alert':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {allActivities.slice(0, 20).map((activity, index) => (
          <div key={index} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
            <div className="flex items-start">
              <div className={`p-2 rounded-full ${getActivityColor(activity.type)} mr-3`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
                {activity.amount && (
                  <p className="text-sm font-medium text-green-600">
                    KSh {activity.amount.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface QuickActionsProps {
  onAction: (action: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const actions = [
    {
      id: 'add-product',
      title: 'Add Product',
      description: 'Add new product to inventory',
      icon: Package,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'process-orders',
      title: 'Process Orders',
      description: 'Review and process pending orders',
      icon: ShoppingCart,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 'customer-support',
      title: 'Customer Support',
      description: 'Handle customer inquiries',
      icon: Users,
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      id: 'inventory-check',
      title: 'Inventory Check',
      description: 'Review low stock items',
      icon: AlertTriangle,
      color: 'bg-red-600 hover:bg-red-700'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={`${action.color} text-white p-4 rounded-lg text-left transition-colors`}
            >
              <div className="flex items-center">
                <action.icon className="h-6 w-6 mr-3" />
                <div>
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}