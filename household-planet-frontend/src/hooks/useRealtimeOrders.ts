import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '@/lib/socket';

export function useRealtimeOrders() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Connect to WebSocket for real-time updates (if available)
    const socket = socketService.connect();

    const handleOrderStatusUpdate = (data: any) => {
      console.log('Received order status update:', data);
      // Invalidate relevant queries when order status changes
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
    };

    // Listen for order status updates (only if socket is available)
    if (socket) {
      socketService.on('orderStatusUpdate', handleOrderStatusUpdate);
    }

    // Fallback polling for critical updates (reduced frequency since we have WebSocket)
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    }, 60000); // Refresh every 60 seconds as fallback

    return () => {
      socketService.off('orderStatusUpdate', handleOrderStatusUpdate);
      clearInterval(interval);
    };
  }, [queryClient]);

  // Manual refresh function
  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['orderStats'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
  };

  return { refreshAll };
}
