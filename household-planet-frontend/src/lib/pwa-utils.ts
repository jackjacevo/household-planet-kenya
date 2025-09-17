// PWA Utility Functions

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

export class PWAManager {
  private static instance: PWAManager;
  private deferredPrompt: PWAInstallPrompt | null = null;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
        
        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          this.handleServiceWorkerUpdate();
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as any;
      this.dispatchEvent('installable', { installable: true });
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.dispatchEvent('installed', { installed: true });
    });

    // Listen for online/offline
    window.addEventListener('online', () => {
      this.dispatchEvent('online', { online: true });
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.dispatchEvent('offline', { online: false });
    });
  }

  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) return false;

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.deferredPrompt = null;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToNotifications(): Promise<PushSubscription | null> {
    if (!this.registration || !('PushManager' in window)) return null;

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ) as any
      });
      
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  async showNotification(payload: NotificationPayload): Promise<void> {
    if (!this.registration) return;

    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-72x72.png',
      tag: payload.tag,
      data: payload.data,
      // actions: payload.actions,
      requireInteraction: payload.requireInteraction,
      silent: payload.silent,
      // vibrate: payload.vibrate || [200, 100, 200]
    };

    await this.registration.showNotification(payload.title, options);
  }

  async cacheCartUpdate(cartData: any): Promise<void> {
    if (!this.registration) return;

    this.registration.active?.postMessage({
      type: 'CACHE_CART_UPDATE',
      data: cartData
    });

    // Register background sync
    if ('sync' in this.registration) {
      await (this.registration as any).sync?.register('cart-sync');
    }
  }

  async getCachedProducts(): Promise<any[]> {
    if (!this.registration) return [];

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.products || []);
      };
      
      this.registration!.active?.postMessage(
        { type: 'GET_CACHED_PRODUCTS' },
        [messageChannel.port2]
      );
      
      // Timeout after 5 seconds
      setTimeout(() => resolve([]), 5000);
    });
  }

  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches;
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  getInstallPromptEvent(): PWAInstallPrompt | null {
    return this.deferredPrompt;
  }

  private handleServiceWorkerUpdate(): void {
    const newWorker = this.registration?.installing;
    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          this.dispatchEvent('updateavailable', { updateAvailable: true });
        }
      });
    }
  }

  private async syncPendingData(): Promise<void> {
    if (!this.registration) return;

    try {
      // Trigger background sync for any pending data
      if ('sync' in this.registration) {
        await (this.registration as any).sync?.register('background-sync');
        await (this.registration as any).sync?.register('cart-sync');
      }
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  private dispatchEvent(type: string, detail: any): void {
    window.dispatchEvent(new CustomEvent(`pwa:${type}`, { detail }));
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Utility functions for common PWA operations
export const pwaUtils = {
  // Check if app is running in standalone mode
  isStandalone: (): boolean => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           (window.navigator as any).standalone === true;
  },

  // Check if device supports PWA features
  supportsPWA: (): boolean => {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  },

  // Get device type for PWA optimizations
  getDeviceType: (): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  },

  // Check if app should show install prompt
  shouldShowInstallPrompt: (): boolean => {
    const lastDismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = lastDismissed ? parseInt(lastDismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    
    return !pwaUtils.isStandalone() && daysSinceDismissed > 7; // Show again after 7 days
  },

  // Save install prompt dismissal
  dismissInstallPrompt: (): void => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  },

  // Get app version from manifest
  getAppVersion: async (): Promise<string> => {
    try {
      const response = await fetch('/manifest.json');
      const manifest = await response.json();
      return manifest.version || '1.0.0';
    } catch {
      return '1.0.0';
    }
  }
};

export default PWAManager;
