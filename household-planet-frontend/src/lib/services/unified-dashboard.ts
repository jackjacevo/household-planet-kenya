'use client';

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