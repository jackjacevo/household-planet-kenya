'use client';

import { lazy, Suspense } from 'react';

// Loading component
const LoadingSpinner = ({ message }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
      <p className="text-sm text-gray-600">{message || 'Loading...'}</p>
    </div>
  </div>
);

// Simple component placeholders
export const LazyOrdersTable = () => (
  <div className="bg-white rounded-lg p-6">
    <div className="text-gray-500">Orders table loading...</div>
  </div>
);

export const LazyProductsTable = () => (
  <div className="bg-white rounded-lg p-6">
    <div className="text-gray-500">Products table loading...</div>
  </div>
);

export const LazyAnalyticsCharts = () => (
  <div className="bg-white rounded-lg p-6">
    <div className="text-gray-500">Analytics loading...</div>
  </div>
);

// Wrapper components
export const OrdersTableWithSuspense = () => <LazyOrdersTable />;
export const ProductsTableWithSuspense = () => <LazyProductsTable />;
export const AnalyticsChartsWithSuspense = () => <LazyAnalyticsCharts />;