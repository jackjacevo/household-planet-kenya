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

// Admin-specific cache management for Phase 3
export class AdminCache extends BrowserCache {
  private static adminInstance: AdminCache;

  static getInstance(): AdminCache {
    if (!AdminCache.adminInstance) {
      AdminCache.adminInstance = new AdminCache();
    }
    return AdminCache.adminInstance;
  }

  // Cache with admin-specific TTL configurations
  setDashboardData(key: string, data: any): void {
    this.setWithStorage(`admin:dashboard:${key}`, data, 2 * 60 * 1000); // 2 minutes
  }

  setOrdersData(key: string, data: any): void {
    this.setWithStorage(`admin:orders:${key}`, data, 30 * 1000); // 30 seconds
  }

  setProductsData(key: string, data: any): void {
    this.setWithStorage(`admin:products:${key}`, data, 5 * 60 * 1000); // 5 minutes
  }

  setAnalyticsData(key: string, data: any): void {
    this.setWithStorage(`admin:analytics:${key}`, data, 10 * 60 * 1000); // 10 minutes
  }

  setCustomersData(key: string, data: any): void {
    this.setWithStorage(`admin:customers:${key}`, data, 5 * 60 * 1000); // 5 minutes
  }

  // Getters with admin prefixes
  getDashboardData(key: string): any | null {
    return this.getWithStorage(`admin:dashboard:${key}`);
  }

  getOrdersData(key: string): any | null {
    return this.getWithStorage(`admin:orders:${key}`);
  }

  getProductsData(key: string): any | null {
    return this.getWithStorage(`admin:products:${key}`);
  }

  getAnalyticsData(key: string): any | null {
    return this.getWithStorage(`admin:analytics:${key}`);
  }

  getCustomersData(key: string): any | null {
    return this.getWithStorage(`admin:customers:${key}`);
  }

  // Clear admin-specific caches
  clearDashboardCache(): void {
    this.clearByPrefix('admin:dashboard:');
  }

  clearOrdersCache(): void {
    this.clearByPrefix('admin:orders:');
  }

  clearProductsCache(): void {
    this.clearByPrefix('admin:products:');
  }

  clearAnalyticsCache(): void {
    this.clearByPrefix('admin:analytics:');
  }

  clearCustomersCache(): void {
    this.clearByPrefix('admin:customers:');
  }

  clearAllAdminCache(): void {
    this.clearByPrefix('admin:');
  }

  // Helper to clear by prefix
  private clearByPrefix(prefix: string): void {
    // Clear memory cache
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }

    // Clear localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }

  // Cache statistics
  getCacheStats() {
    const stats = {
      dashboard: 0,
      orders: 0,
      products: 0,
      analytics: 0,
      customers: 0,
      total: 0
    };

    for (const key of this.cache.keys()) {
      if (key.startsWith('admin:dashboard:')) stats.dashboard++;
      else if (key.startsWith('admin:orders:')) stats.orders++;
      else if (key.startsWith('admin:products:')) stats.products++;
      else if (key.startsWith('admin:analytics:')) stats.analytics++;
      else if (key.startsWith('admin:customers:')) stats.customers++;
      stats.total++;
    }

    return stats;
  }
}

// IndexedDB cache for large datasets (virtualization support)
export class IndexedDBCache {
  private dbName = 'HouseholdPlanetDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores for admin data
        if (!db.objectStoreNames.contains('dashboard')) {
          db.createObjectStore('dashboard', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('orders')) {
          const ordersStore = db.createObjectStore('orders', { keyPath: 'id' });
          ordersStore.createIndex('status', 'status', { unique: false });
          ordersStore.createIndex('date', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', { keyPath: 'id' });
          productsStore.createIndex('category', 'categoryId', { unique: false });
          productsStore.createIndex('stock', 'stock', { unique: false });
        }
        if (!db.objectStoreNames.contains('customers')) {
          db.createObjectStore('customers', { keyPath: 'id' });
        }
      };
    });
  }

  async set(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.put({
        ...data,
        timestamp: Date.now()
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get(storeName: string, key: any): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Check if data is still fresh (1 hour TTL for IndexedDB)
          if (Date.now() - result.timestamp < 60 * 60 * 1000) {
            resolve(result);
          } else {
            this.delete(storeName, key);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
    });
  }

  async getAll(storeName: string, limit?: number): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = limit ? store.getAll(undefined, limit) : store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result.filter(item => {
          return Date.now() - item.timestamp < 60 * 60 * 1000;
        });
        resolve(results);
      };
    });
  }

  async delete(storeName: string, key: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Singleton instances
export const adminCache = AdminCache.getInstance();
export const idbCache = new IndexedDBCache();

// Initialize IndexedDB cache
if (typeof window !== 'undefined') {
  idbCache.init().catch(console.error);
}
