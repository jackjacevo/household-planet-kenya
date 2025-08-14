'use client';

import { useState, useEffect, useCallback } from 'react';

interface PWAState {
  isOnline: boolean;
  isInstalled: boolean;
  hasUpdate: boolean;
  canInstall: boolean;
  isLoading: boolean;
  pushSupported: boolean;
  pushSubscribed: boolean;
}

interface SyncData {
  type: string;
  data: any;
  endpoint: string;
  method?: string;
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isOnline: true,
    isInstalled: false,
    hasUpdate: false,
    canInstall: false,
    isLoading: true,
    pushSupported: false,
    pushSubscribed: false
  });

  useEffect(() => {
    let registration: ServiceWorkerRegistration | null = null;

    // Check if PWA is installed
    const checkInstalled = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true ||
                         document.referrer.includes('android-app://');
      setState(prev => ({ ...prev, isInstalled }));
    };

    // Check online status
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      setState(prev => ({ ...prev, isOnline }));
      
      // Trigger sync when coming back online
      if (isOnline && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          if ('sync' in reg) {
            reg.sync.register('general-sync').catch(console.error);
          }
        });
      }
    };

    // Check push notification support
    const checkPushSupport = async () => {
      const pushSupported = 'PushManager' in window && 'Notification' in window;
      let pushSubscribed = false;
      
      if (pushSupported && 'serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          const subscription = await reg.pushManager.getSubscription();
          pushSubscribed = !!subscription;
        } catch (error) {
          console.error('Push subscription check failed:', error);
        }
      }
      
      setState(prev => ({ ...prev, pushSupported, pushSubscribed }));
    };

    // Register service worker
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          
          console.log('SW registered:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration!.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setState(prev => ({ ...prev, hasUpdate: true }));
                }
              });
            }
          });

          // Listen for messages from SW
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'CACHE_UPDATED') {
              console.log('Cache updated:', event.data.url);
            }
          });

        } catch (error) {
          console.error('SW registration failed:', error);
        }
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
    };

    // Check for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState(prev => ({ ...prev, canInstall: true }));
      (window as any).deferredPrompt = e;
    };

    // Handle app installed
    const handleAppInstalled = () => {
      setState(prev => ({ ...prev, isInstalled: true, canInstall: false }));
      (window as any).deferredPrompt = null;
    };

    const init = async () => {
      checkInstalled();
      updateOnlineStatus();
      await registerSW();
      await checkPushSupport();
    };

    init();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      
      if (granted) {
        // Auto-subscribe to push notifications
        await subscribeToPush();
      }
      
      return granted;
    }
    return false;
  }, []);

  const subscribeToPush = useCallback(async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Check if already subscribed
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          setState(prev => ({ ...prev, pushSubscribed: true }));
          return true;
        }
        
        // Get VAPID key from server
        const vapidResponse = await fetch('/api/push/vapid-key');
        const { publicKey } = await vapidResponse.json();
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey
        });
        
        // Send subscription to server
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
        
        if (response.ok) {
          setState(prev => ({ ...prev, pushSubscribed: true }));
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Push subscription failed:', error);
        return false;
      }
    }
    return false;
  }, []);

  const syncData = useCallback(async (tag: string, data?: any) => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Store data for sync if provided
        if (data) {
          await storeForSync(data);
        }
        
        await registration.sync.register(tag);
        return true;
      } catch (error) {
        console.error('Background sync failed:', error);
        return false;
      }
    }
    return false;
  }, []);

  const storeForSync = async (syncData: SyncData) => {
    try {
      const db = await openIndexedDB();
      const tx = db.transaction(['syncQueue'], 'readwrite');
      const store = tx.objectStore('syncQueue');
      
      await store.add({
        ...syncData,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to store sync data:', error);
    }
  };

  const openIndexedDB = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('household-planet-cache', 2);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  };

  const installApp = useCallback(async () => {
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setState(prev => ({ ...prev, isInstalled: true, canInstall: false }));
        }
        
        (window as any).deferredPrompt = null;
        return outcome === 'accepted';
      } catch (error) {
        console.error('Install prompt failed:', error);
        return false;
      }
    }
    return false;
  }, []);

  const unsubscribeFromPush = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          
          // Notify server
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subscription.endpoint })
          });
          
          setState(prev => ({ ...prev, pushSubscribed: false }));
          return true;
        }
      } catch (error) {
        console.error('Push unsubscribe failed:', error);
      }
    }
    return false;
  }, []);

  return {
    ...state,
    updateApp,
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    syncData,
    installApp
  };
}