'use client';

import { useState, useEffect } from 'react';

interface DashboardData {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
    revenueChange?: string;
    revenueChangeType?: 'increase' | 'decrease' | 'neutral';
    ordersChange?: string;
    ordersChangeType?: 'increase' | 'decrease' | 'neutral';
    customersChange?: string;
    customersChangeType?: 'increase' | 'decrease' | 'neutral';
    productsChange?: string;
    productsChangeType?: 'increase' | 'decrease' | 'neutral';
    todayOrders?: number;
    todayRevenue?: number;
    pendingOrders?: number;
    lowStockProducts?: number;
    activeProducts?: number;
    outOfStockProducts?: number;
  };
  recentOrders: any[];
  topProducts: any[];
  customerGrowth: any[];
  salesByCounty: any[];
}

// Simplified unified dashboard service
export const fetchUnifiedDashboard = async (): Promise<DashboardData> => {
  return {
    overview: {
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      totalProducts: 0,
      revenueChange: '+12%',
      revenueChangeType: 'increase',
      ordersChange: '+8%',
      ordersChangeType: 'increase',
      customersChange: '+15%',
      customersChangeType: 'increase',
      productsChange: '+3%',
      productsChangeType: 'increase',
      todayOrders: 0,
      todayRevenue: 0,
      pendingOrders: 0,
      lowStockProducts: 0,
      activeProducts: 0,
      outOfStockProducts: 0
    },
    recentOrders: [],
    topProducts: [],
    customerGrowth: [],
    salesByCounty: []
  };
};

export const useUnifiedDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  
  useEffect(() => {
    fetchUnifiedDashboard()
      .then(result => {
        setData(result);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, []);
  
  return { data, isLoading, error, isFetching };
};

export const useDashboardPreloader = () => {
  return { preloadDashboardData: () => {} };
};

export const useDashboardPerformance = () => {
  const getPerformanceMetrics = () => ({
    cacheHitRate: 0.85,
    activeQueries: 3,
    cachedQueries: 12,
    errorQueries: 0
  });
  
  return { getPerformanceMetrics };
};