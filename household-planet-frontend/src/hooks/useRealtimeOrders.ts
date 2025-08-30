import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeOrders() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Simple polling fallback for real-time updates
    const interval = setInterval(() => {
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }, 15000); // Refresh every 15 seconds for critical updates

    return () => clearInterval(interval);
  }, [queryClient]);

  // Manual refresh function
  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['orderStats'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
  };

  return { refreshAll };
}