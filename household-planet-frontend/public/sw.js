const CACHE_NAME = 'household-planet-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';
const CART_CACHE = 'cart-sync-v1';

const STATIC_ASSETS = [
  '/',
  '/products',
  '/categories',
  '/about',
  '/contact',
  '/offline',
  '/manifest.json',
  '/cart',
  '/dashboard',
  '/icons/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/categories/,
  /\/api\/content/
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
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
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
  if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
    event.respondWith(handleStaticAssets(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Default: try cache first, then network
  event.respondWith(
    caches.match(request)
      .then(response => response || fetch(request))
      .catch(() => caches.match('/offline'))
  );
});

// Handle API requests - Network first, cache fallback
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline data for specific endpoints
    if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return new Response(JSON.stringify({ 
        offline: true, 
        data: [], 
        message: 'Offline mode - showing cached data' 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    throw error;
  }
}

// Handle static assets - Cache first
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Handle navigation - Cache first with network fallback
async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return caches.match('/offline');
  }
}

// Background sync for cart updates
self.addEventListener('sync', event => {
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCartUpdates());
  } else if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function syncCartUpdates() {
  try {
    const cache = await caches.open(CART_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      try {
        const response = await fetch(request.clone());
        if (response.ok) {
          await cache.delete(request);
          // Notify clients of successful sync with error handling
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              try {
                client.postMessage({ type: 'CART_SYNCED', success: true });
              } catch (error) {
                console.error('Failed to notify client:', error);
              }
            });
          }).catch(error => {
            console.error('Failed to get clients:', error);
          });
        }
      } catch (error) {
        console.log('Cart sync failed for:', request.url);
      }
    }
  } catch (error) {
    console.error('Cart sync error:', error);
  }
}

async function doBackgroundSync() {
  const cache = await caches.open('sync-cache');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      await fetch(request);
      await cache.delete(request);
    } catch (error) {
      console.log('Sync failed for:', request.url);
    }
  }
}

// Enhanced push notifications for order status
self.addEventListener('push', event => {
  let notificationData = {
    title: 'Household Planet Kenya',
    body: 'New notification from Household Planet Kenya',
    type: 'general'
  };

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    vibrate: [200, 100, 200],
    data: {
      ...notificationData,
      dateOfArrival: Date.now(),
      clickUrl: getNotificationUrl(notificationData.type, notificationData.orderId)
    },
    actions: getNotificationActions(notificationData.type),
    requireInteraction: notificationData.type === 'order_delivered'
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title || 'Household Planet Kenya', options)
  );
});

function getNotificationUrl(type, orderId) {
  switch (type) {
    case 'order_confirmed':
    case 'order_shipped':
    case 'order_delivered':
      return orderId ? `/dashboard/orders/${orderId}` : '/dashboard/orders';
    case 'flash_sale':
      return '/products?sale=true';
    default:
      return '/';
  }
}

function getNotificationActions(type) {
  switch (type) {
    case 'order_confirmed':
    case 'order_shipped':
      return [
        { action: 'track', title: 'Track Order', icon: '/icons/icon.svg' },
        { action: 'close', title: 'Close', icon: '/icons/icon.svg' }
      ];
    case 'order_delivered':
      return [
        { action: 'review', title: 'Leave Review', icon: '/icons/icon.svg' },
        { action: 'close', title: 'Close', icon: '/icons/icon.svg' }
      ];
    case 'flash_sale':
      return [
        { action: 'shop', title: 'Shop Now', icon: '/icons/icon.svg' },
        { action: 'close', title: 'Close', icon: '/icons/icon.svg' }
      ];
    default:
      return [
        { action: 'open', title: 'Open App', icon: '/icons/icon.svg' },
        { action: 'close', title: 'Close', icon: '/icons/icon.svg' }
      ];
  }
}

// Enhanced notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const data = event.notification.data;
  let targetUrl = data?.clickUrl || '/';

  switch (event.action) {
    case 'track':
      targetUrl = data?.orderId ? `/dashboard/orders/${data.orderId}` : '/dashboard/orders';
      break;
    case 'review':
      targetUrl = data?.orderId ? `/dashboard/orders/${data.orderId}?review=true` : '/dashboard/orders';
      break;
    case 'shop':
      targetUrl = '/products?sale=true';
      break;
    case 'open':
      targetUrl = data?.clickUrl || '/';
      break;
    case 'close':
      return;
    default:
      targetUrl = data?.clickUrl || '/';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Enhanced message handling with error handling
self.addEventListener('message', event => {
  try {
    const { type, data } = event.data || {};
    
    switch (type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'CACHE_CART_UPDATE':
        cacheCartUpdate(data);
        break;
      case 'GET_CACHED_PRODUCTS':
        getCachedProducts().then(products => {
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ products });
          }
        }).catch(error => {
          console.error('Error getting cached products:', error);
        });
        break;
    }
  } catch (error) {
    console.error('Service worker message handling error:', error);
  }
});

async function cacheCartUpdate(updateData) {
  try {
    const cache = await caches.open(CART_CACHE);
    const request = new Request('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    await cache.put(request, new Response('pending'));
    
    // Try to sync immediately if online
    if (navigator.onLine) {
      self.registration.sync.register('cart-sync');
    }
  } catch (error) {
    console.error('Failed to cache cart update:', error);
  }
}

async function getCachedProducts() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = await cache.match('/api/products');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to get cached products:', error);
  }
  return [];
}