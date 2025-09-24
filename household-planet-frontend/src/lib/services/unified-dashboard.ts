'use client';

import { useState, useEffect } from 'react';

// Simplified unified dashboard service
export const fetchUnifiedDashboard = async () => {
  return {
    overview: {
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      totalProducts: 0
    },
    recentOrders: [],
    topProducts: [],
    customerGrowth: [],
    salesByCounty: []
  };
};

export const useUnifiedDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUnifiedDashboard().then(result => {
      setData(result);
      setLoading(false);
    });
  }, []);
  
  return { data, loading };
};

export const useDashboardPreloader = () => {
  return { preload: () => {} };
};

export const useDashboardPerformance = () => {
  return { metrics: {} };
};