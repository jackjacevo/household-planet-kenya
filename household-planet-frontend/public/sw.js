const CACHE_NAME = 'household-planet-v1.1.0';
const STATIC_CACHE = 'static-v1.1.0';
const DYNAMIC_CACHE = 'dynamic-v1.1.0';
const IMAGE_CACHE = 'images-v1.1.0';
const API_CACHE = 'api-v1.1.0';

const STATIC_ASSETS = [
  '/',
  '/products',
  '/cart',
  '/auth/login',
  '/dashboard',
  '/checkout',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/categories/,
  /\/api\/auth\/me/,
  /\/api\/cart/,
  /\/api\/orders/
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(DYNAMIC_CACHE),
      caches.open(IMAGE_CACHE),
      caches.open(API_CACHE)
    ]).then(() => {
      console.log('SW: All caches initialized');
      self.skipWaiting();
    })
  );
});

// Activate event
self.addEventListener('activate', event => {
  const expectedCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!expectedCaches.includes(cacheName)) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Activated and claiming clients');
        self.clients.claim();
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle images
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Handle static assets
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'font') {
    event.respondWith(handleStaticAssets(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Default stale-while-revalidate strategy
  event.respondWith(handleStaleWhileRevalidate(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const cacheName = API_CACHE;
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      
      // Cache specific API responses
      if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
        cache.put(request, networkResponse.clone());
      }
      
      // Store products in IndexedDB for offline browsing
      if (url.pathname.includes('/api/products')) {
        const data = await networkResponse.clone().json();
        await storeProductsOffline(data.products || data.data || []);
      }
      
      // Store user data
      if (url.pathname.includes('/api/auth/me')) {
        const userData = await networkResponse.clone().json();
        await storeUserData(userData);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('SW: Network failed, trying cache for:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline data from IndexedDB
    if (url.pathname.includes('/api/products')) {
      const offlineProducts = await getOfflineProducts();
      return new Response(JSON.stringify({
        products: offlineProducts,
        message: 'Showing cached products - you are offline',
        offline: true,
        success: true
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'X-Offline': 'true'
        }
      });
    }
    
    if (url.pathname.includes('/api/cart')) {
      const offlineCart = await getOfflineCart();
      return new Response(JSON.stringify({
        cart: offlineCart,
        message: 'Showing cached cart - you are offline',
        offline: true
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Store products for offline browsing
async function storeProductsOffline(products) {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['products'], 'readwrite');
    const store = tx.objectStore('products');
    
    for (const product of products) {
      await store.put({
        ...product,
        cachedAt: Date.now()
      });
    }
    
    console.log(`SW: Stored ${products.length} products offline`);
  } catch (error) {
    console.error('Failed to store products offline:', error);
  }
}

// Store user data
async function storeUserData(userData) {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['user'], 'readwrite');
    const store = tx.objectStore('user');
    
    await store.put({
      id: 'current-user',
      data: userData,
      cachedAt: Date.now()
    });
  } catch (error) {
    console.error('Failed to store user data:', error);
  }
}

// Get offline products
async function getOfflineProducts() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['products'], 'readonly');
    const store = tx.objectStore('products');
    const products = await store.getAll();
    
    // Filter out old cached products (older than 24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return products.filter(product => 
      product.cachedAt && product.cachedAt > oneDayAgo
    );
  } catch (error) {
    console.error('Failed to get offline products:', error);
    return [];
  }
}

// Get offline cart
async function getOfflineCart() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['cart'], 'readonly');
    const store = tx.objectStore('cart');
    const cartData = await store.get('current-cart');
    return cartData ? cartData.items : [];
  } catch (error) {
    console.error('Failed to get offline cart:', error);
    return [];
  }
}

// Open IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('household-planet-cache', 2);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Products store
      if (!db.objectStoreNames.contains('products')) {
        const productsStore = db.createObjectStore('products', { keyPath: 'id' });
        productsStore.createIndex('category', 'category', { unique: false });
        productsStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }
      
      // Cart store
      if (!db.objectStoreNames.contains('cart')) {
        db.createObjectStore('cart', { keyPath: 'id' });
      }
      
      // User store
      if (!db.objectStoreNames.contains('user')) {
        db.createObjectStore('user', { keyPath: 'id' });
      }
      
      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('type', 'type', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Handle images with cache-first strategy
async function handleImageRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return placeholder image for offline
    return new Response(
      '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Image unavailable</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Asset unavailable offline', { status: 503 });
  }
}

// Stale-while-revalidate strategy
async function handleStaleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Handle navigation with cache-first for known routes
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return caches.match('/offline.html');
  }
}

// Background sync
self.addEventListener('sync', event => {
  console.log('SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCartData());
  }
  if (event.tag === 'order-sync') {
    event.waitUntil(syncOrderData());
  }
  if (event.tag === 'general-sync') {
    event.waitUntil(syncAllPendingData());
  }
});

// Push notifications
self.addEventListener('push', event => {
  let notificationData = {};
  
  try {
    notificationData = event.data ? event.data.json() : {};
  } catch (error) {
    notificationData = { body: event.data ? event.data.text() : 'New notification' };
  }
  
  const options = {
    body: notificationData.body || 'New notification from Household Planet Kenya',
    icon: notificationData.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: notificationData,
    tag: notificationData.tag || 'general',
    requireInteraction: notificationData.requireInteraction || false,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    timestamp: Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'Household Planet Kenya', 
      options
    )
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no existing window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Sync all pending data
async function syncAllPendingData() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['syncQueue'], 'readonly');
    const store = tx.objectStore('syncQueue');
    const pendingItems = await store.getAll();
    
    for (const item of pendingItems) {
      try {
        await syncItem(item);
        await removeSyncItem(item.id);
      } catch (error) {
        console.error('Failed to sync item:', item, error);
      }
    }
  } catch (error) {
    console.error('General sync failed:', error);
  }
}

// Sync cart data
async function syncCartData() {
  try {
    const cartData = await getStoredCartData();
    if (cartData && cartData.length > 0) {
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartData })
      });
      
      if (response.ok) {
        await clearStoredCartData();
        console.log('SW: Cart synced successfully');
      }
    }
  } catch (error) {
    console.error('Cart sync failed:', error);
  }
}

// Sync order data
async function syncOrderData() {
  try {
    const orderData = await getStoredOrderData();
    if (orderData) {
      const response = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      if (response.ok) {
        await clearStoredOrderData();
        console.log('SW: Order synced successfully');
      }
    }
  } catch (error) {
    console.error('Order sync failed:', error);
  }
}

// Helper functions for sync queue
async function syncItem(item) {
  const { type, data, endpoint, method = 'POST' } = item;
  
  const response = await fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }
  
  return response.json();
}

async function removeSyncItem(id) {
  const db = await openIndexedDB();
  const tx = db.transaction(['syncQueue'], 'readwrite');
  const store = tx.objectStore('syncQueue');
  await store.delete(id);
}

async function getStoredCartData() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['cart'], 'readonly');
    const store = tx.objectStore('cart');
    const cartData = await store.get('pending-sync');
    return cartData ? cartData.items : [];
  } catch (error) {
    console.error('Failed to get stored cart data:', error);
    return [];
  }
}

async function clearStoredCartData() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['cart'], 'readwrite');
    const store = tx.objectStore('cart');
    await store.delete('pending-sync');
  } catch (error) {
    console.error('Failed to clear stored cart data:', error);
  }
}

async function getStoredOrderData() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['syncQueue'], 'readonly');
    const store = tx.objectStore('syncQueue');
    const index = store.index('type');
    const orderItems = await index.getAll('order');
    return orderItems.length > 0 ? orderItems[0] : null;
  } catch (error) {
    console.error('Failed to get stored order data:', error);
    return null;
  }
}

async function clearStoredOrderData() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['syncQueue'], 'readwrite');
    const store = tx.objectStore('syncQueue');
    const index = store.index('type');
    const orderItems = await index.getAll('order');
    
    for (const item of orderItems) {
      await store.delete(item.id);
    }
  } catch (error) {
    console.error('Failed to clear stored order data:', error);
  }
}

// Message handling for skip waiting
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});