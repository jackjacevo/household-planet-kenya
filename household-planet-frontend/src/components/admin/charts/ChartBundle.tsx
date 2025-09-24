'use client';

import React, { lazy, Suspense } from 'react';
import { isFeatureEnabled } from '@/lib/config/admin-config';

// Simple chart placeholders
const LazyRevenueChart = () => (
  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
    <div className="text-gray-500">Revenue Chart</div>
  </div>
);

const LazyOrdersChart = () => (
  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
    <div className="text-gray-500">Orders Chart</div>
  </div>
);

// Chart loading fallback
const ChartLoader = () => (
  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="animate-pulse bg-gray-200 h-4 w-32 mx-auto mb-2 rounded"></div>
      <div className="animate-pulse bg-gray-200 h-3 w-24 mx-auto rounded"></div>
    </div>
  </div>
);

interface ChartBundleProps {
  type: 'revenue' | 'orders';
  data?: any;
}

export const ChartBundle: React.FC<ChartBundleProps> = ({ type, data }) => {
  if (!isFeatureEnabled('advancedCaching')) {
    return <div className="text-sm text-gray-500">Charts disabled</div>;
  }

  return (
    <div>
      {type === 'revenue' ? (
        <LazyRevenueChart />
      ) : (
        <LazyOrdersChart />
      )}
    </div>
  );
};