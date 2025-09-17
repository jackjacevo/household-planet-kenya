// Browser cache utilities
export class BrowserCache {
  private static instance: BrowserCache;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static getInstance(): BrowserCache {
    if (!BrowserCache.instance) {
      BrowserCache.instance = new BrowserCache();
    }
    return BrowserCache.instance;
  }

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cache with localStorage fallback
  setWithStorage(key: string, data: any, ttl: number = 300000): void {
    this.set(key, data, ttl);
    
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(key, JSON.stringify({
          data,
          timestamp: Date.now(),
          ttl,
        }));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  }

  getWithStorage(key: string): any | null {
    // Try memory cache first
    const memoryData = this.get(key);
    if (memoryData) return memoryData;

    // Fallback to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const item = JSON.parse(stored);
          if (Date.now() - item.timestamp <= item.ttl) {
            this.set(key, item.data, item.ttl);
            return item.data;
          } else {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }

    return null;
  }
}

// Service Worker cache utilities
export const swCache = {
  async put(request: string | Request, response: Response): Promise<void> {
    if ('caches' in window) {
      const cache = await caches.open('household-planet-v1');
      await cache.put(request, response);
    }
  },

  async get(request: string | Request): Promise<Response | undefined> {
    if ('caches' in window) {
      const cache = await caches.open('household-planet-v1');
      return await cache.match(request);
    }
  },

  async delete(request: string | Request): Promise<boolean> {
    if ('caches' in window) {
      const cache = await caches.open('household-planet-v1');
      return await cache.delete(request);
    }
    return false;
  },
};

// Query cache for API responses
export const queryCache = BrowserCache.getInstance();
