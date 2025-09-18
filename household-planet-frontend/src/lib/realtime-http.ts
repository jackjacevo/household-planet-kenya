// HTTP-based real-time updates (replaces WebSocket)
class RealtimeService {
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  startPolling(endpoint: string, callback: (data: any) => void, intervalMs = 5000) {
    if (this.intervals.has(endpoint)) {
      this.stopPolling(endpoint);
    }

    const poll = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api${endpoint}`);
        if (response.ok) {
          const data = await response.json();
          callback(data);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    const interval = setInterval(poll, intervalMs);
    this.intervals.set(endpoint, interval);
    
    // Initial poll
    poll();
  }

  stopPolling(endpoint: string) {
    const interval = this.intervals.get(endpoint);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(endpoint);
    }
  }

  stopAll() {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
  }
}

export const realtimeService = new RealtimeService();