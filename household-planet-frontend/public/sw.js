const CACHE_NAME = 'household-planet-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

const STATIC_ASSETS = [
  '/',
  '/products',
  '/cart',
  '/auth/login',
  '/manifest.json',
  '/offline.html',
  '/_next/static/css/app/layout.css',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/main-app.js'
];

const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/categories/,
  /\/api\/auth\/me/
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (request.destination === 'image' || request.destination === 'script' || request.destination === 'style') {
    event.respondWith(handleStaticAssets(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Default cache-first strategy
  event.respondWith(
    caches.match(request)
      .then(response => response || fetch(request))
      .catch(() => caches.match('/offline.html'))
  );
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cacheName = DYNAMIC_CACHE;
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      
      // Store products in IndexedDB for offline browsing
      if (request.url.includes('/api/products')) {
        const data = await networkResponse.clone().json();
        await storeProductsOffline(data.products || []);
      }
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline products from IndexedDB
    if (request.url.includes('/api/products')) {
      const offlineProducts = await getOfflineProducts();
      return new Response(JSON.stringify({
        products: offlineProducts,
        message: 'Showing cached products - you are offline',
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
      await store.put(product);
    }
  } catch (error) {
    console.error('Failed to store products offline:', error);
  }
}

// Get offline products
async function getOfflineProducts() {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['products'], 'readonly');
    const store = tx.objectStore('products');
    return await store.getAll();
  } catch (error) {
    console.error('Failed to get offline products:', error);
    return [];
  }
}

// Open IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('household-planet-cache', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('cart')) {
        db.createObjectStore('cart', { keyPath: 'id' });
      }
    };
  });
}

// Handle static assets with cache-first strategy
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    return new Response('Asset unavailable offline', { status: 503 });
  }
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
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCartData());
  }
  if (event.tag === 'order-sync') {
    event.waitUntil(syncOrderData());
  }
});

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Household Planet Kenya',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: event.data ? JSON.parse(event.data.text()) : {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss-icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Household Planet Kenya', options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    const urlToOpen = event.notification.data.url || '/';
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});

// Sync functions
async function syncCartData() {
  try {
    const cartData = await getStoredCartData();
    if (cartData) {
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartData)
      });
      clearStoredCartData();
    }
  } catch (error) {
    console.error('Cart sync failed:', error);
  }
}

async function syncOrderData() {
  try {
    const orderData = await getStoredOrderData();
    if (orderData) {
      await fetch('/api/orders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      clearStoredOrderData();
    }
  } catch (error) {
    console.error('Order sync failed:', error);
  }
}

function getStoredCartData() {
  return new Promise(resolve => {
    // Implementation would get data from IndexedDB
    resolve(null);
  });
}

function clearStoredCartData() {
  // Implementation would clear IndexedDB data
}

function getStoredOrderData() {
  return new Promise(resolve => {
    resolve(null);
  });
}

function clearStoredOrderData() {
  // Implementation would clear IndexedDB data
}