'use client';

import { useEffect, useState } from 'react';
import { isFeatureEnabled } from '@/lib/config/admin-config';
import { useDashboardData } from '@/hooks/useDashboardData';
import { ChartBundle } from './charts/ChartBundle';

export const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({ loadTime: 0, renderTime: 0 });
  const { data, isLoading, error } = useDashboardData();

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      setMetrics(prev => ({ ...prev, loadTime: endTime - startTime }));
    };
  }, []);

  if (!isFeatureEnabled('unifiedDashboard')) {
    return <div className="text-sm text-gray-500">Performance dashboard disabled</div>;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Failed to load dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartBundle type="revenue" data={data?.revenueData} />
        <ChartBundle type="orders" data={data?.recentOrders} />
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400">
          Load time: {metrics.loadTime.toFixed(2)}ms
        </div>
      )}
    </div>
  );
};