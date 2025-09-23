import { QueryClient } from '@tanstack/react-query';

class RealtimeSync {
  private ws: WebSocket | null = null;
  private pollInterval: NodeJS.Timeout | null = null;
  private queryClient: QueryClient | null = null;
  private isConnected = false;

  connect(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.connectWebSocket();
    this.startPolling();
  }

  private connectWebSocket() {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        this.isConnected = true;
        this.stopPolling();
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'dashboard-update' && this.queryClient) {
          this.queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          this.queryClient.invalidateQueries({ queryKey: ['pendingOrdersCount'] });
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.startPolling();
      };
    } catch {
      this.startPolling();
    }
  }

  private startPolling() {
    if (this.pollInterval || !this.queryClient) return;
    
    this.pollInterval = setInterval(() => {
      if (!this.isConnected && this.queryClient) {
        this.queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        this.queryClient.invalidateQueries({ queryKey: ['pendingOrdersCount'] });
      }
    }, 10000);
  }

  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  disconnect() {
    this.ws?.close();
    this.stopPolling();
    this.queryClient = null;
  }
}

export const realtimeSync = new RealtimeSync();

export function useRealtimeOrders() {
  const refreshAll = () => {
    // Trigger custom events for order changes
    window.dispatchEvent(new CustomEvent('orderCreated'));
    window.dispatchEvent(new CustomEvent('orderStatusChanged'));
  };

  return { refreshAll };
}