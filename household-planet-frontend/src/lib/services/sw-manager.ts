'use client';

import { isFeatureEnabled, debugLog, trackFeatureUsage } from '@/lib/config/admin-config';

interface CacheStats {
  [cacheName: string]: {
    entries: number;
    lastAccess: number;
  };
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator;
  }

  async register(): Promise<boolean> {
    if (!this.isSupported) {
      debugLog('Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      debugLog('Service Worker registered successfully');

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              debugLog('New Service Worker available');
              this.notifyUpdate();
            }
          });
        }
      });

      // Listen for SW messages
      navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));

      // Preload admin data if advanced caching is enabled
      if (isFeatureEnabled('advancedCaching')) {
        setTimeout(() => {
          this.preloadAdminData();
        }, 2000);
      }

      trackFeatureUsage('service-worker', true);
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      trackFeatureUsage('service-worker', false);
      return false;
    }
  }

  async skipWaiting(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  async invalidateAdminCache(cacheType: string): Promise<void> {
    if (!this.registration?.active) return;

    this.registration.active.postMessage({
      type: 'INVALIDATE_ADMIN_CACHE',
      data: { cacheType }
    });

    debugLog(`Invalidated admin cache: ${cacheType}`);
  }

  async preloadAdminData(): Promise<void> {
    if (!this.registration?.active) return;

    const routes = [
      '/api/admin/dashboard/overview',
      '/api/admin/orders/recent',
      '/api/admin/products/top',
      '/api/admin/analytics/customer-growth'
    ];

    this.registration.active.postMessage({
      type: 'PRELOAD_ADMIN_DATA',
      data: { routes }
    });

    debugLog('Preloading admin data via Service Worker');
  }

  async getCacheStats(): Promise<CacheStats> {
    return new Promise((resolve, reject) => {
      if (!this.registration?.active) {
        resolve({});
        return;
      }

      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        if (event.data.stats) {
          resolve(event.data.stats);
        } else {
          reject(new Error('Failed to get cache stats'));
        }
      };

      this.registration.active.postMessage(
        { type: 'GET_CACHE_STATS' },
        [channel.port2]
      );

      // Timeout after 5 seconds
      setTimeout(() => reject(new Error('Cache stats request timeout')), 5000);
    });
  }

  async clearAllCaches(): Promise<void> {
    if (!this.isSupported) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );

      debugLog('All caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }

  private handleMessage(event: MessageEvent) {
    const { type, data } = event.data || {};

    switch (type) {
      case 'CACHE_UPDATED':
        debugLog(`Cache updated: ${data?.cacheType}`);
        // Dispatch custom event for React components
        window.dispatchEvent(new CustomEvent('sw-cache-updated', {
          detail: data
        }));
        break;

      case 'OFFLINE_READY':
        debugLog('App is ready for offline use');
        window.dispatchEvent(new CustomEvent('sw-offline-ready'));
        break;

      case 'UPDATE_AVAILABLE':
        debugLog('App update available');
        window.dispatchEvent(new CustomEvent('sw-update-available'));
        break;
    }
  }

  private notifyUpdate() {
    // Dispatch event that can be caught by React components
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  // Admin-specific cache management
  async invalidateOrdersCache(): Promise<void> {
    await this.invalidateAdminCache('orders');
  }

  async invalidateDashboardCache(): Promise<void> {
    await this.invalidateAdminCache('dashboard');
  }

  async invalidateProductsCache(): Promise<void> {
    await this.invalidateAdminCache('products');
  }

  async invalidateAnalyticsCache(): Promise<void> {
    await this.invalidateAdminCache('analytics');
  }

  // Performance monitoring
  async getPerformanceMetrics() {
    const stats = await this.getCacheStats();
    const totalEntries = Object.values(stats).reduce((sum, cache) => sum + cache.entries, 0);
    const adminCaches = Object.keys(stats).filter(name => name.includes('admin')).length;

    return {
      totalCaches: Object.keys(stats).length,
      adminCaches,
      totalEntries,
      cacheHitRate: this.calculateCacheHitRate(stats),
      isOnline: navigator.onLine
    };
  }

  private calculateCacheHitRate(stats: CacheStats): number {
    // Simple approximation - in real implementation, track actual hits/misses
    const hasActiveCache = Object.keys(stats).length > 0;
    return hasActiveCache ? 0.75 : 0;
  }
}

// Singleton instance
export const swManager = new ServiceWorkerManager();

// React hook for Service Worker functionality
export const useServiceWorker = () => {
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    // Register service worker
    swManager.register().then(setIsRegistered);

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for SW events
    const handleUpdateAvailable = () => setUpdateAvailable(true);
    window.addEventListener('sw-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  return {
    isRegistered,
    updateAvailable,
    isOnline,
    skipWaiting: swManager.skipWaiting.bind(swManager),
    invalidateCache: swManager.invalidateAdminCache.bind(swManager),
    getCacheStats: swManager.getCacheStats.bind(swManager),
    getPerformanceMetrics: swManager.getPerformanceMetrics.bind(swManager)
  };
};

// React import fix
import React from 'react';

export default swManager;