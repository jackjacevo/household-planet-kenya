'use client';

import { useQuery } from '@tanstack/react-query';
import { adminConfig, isFeatureEnabled } from '@/lib/config/admin-config';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: any[];
  revenueData: any[];
}

// Unified dashboard data fetcher
const fetchDashboardUnified = async (): Promise<DashboardStats> => {
  const response = await fetch(`${adminConfig.apiUrl}/admin/dashboard/unified`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch dashboard data');
  return response.json();
};

// Fallback individual fetchers
const fetchOrderStats = async () => {
  const response = await fetch(`${adminConfig.apiUrl}/admin/orders/stats`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch order stats');
  return response.json();
};

// Main hook with feature flag support
export const useDashboardData = () => {
  const { features } = adminConfig;

  // Try new unified approach
  const unifiedData = useQuery({
    queryKey: ['dashboard-unified'],
    queryFn: fetchDashboardUnified,
    enabled: features.unifiedDashboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fallback to existing approach
  const fallbackStats = useQuery({
    queryKey: ['orderStats'],
    queryFn: fetchOrderStats,
    enabled: !features.unifiedDashboard,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return features.unifiedDashboard ? unifiedData : fallbackStats;
};