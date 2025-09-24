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
  '/admin',
  '/admin/dashboard',
  '/admin/orders',
  '/admin/products',
  '/icons/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/categories/,
  /\/api\/content/,
  /\/api\/admin\/dashboard/,
  /\/api\/admin\/orders/,
  /\/api\/admin\/analytics/
];

// Admin-specific cache patterns for Phase 3
const ADMIN_CACHE_PATTERNS = {
  dashboard: /\/api\/admin\/dashboard/,
  orders: /\/api\/admin\/orders/,
  products: /\/api\/admin\/products/,
  analytics: /\/api\/admin\/analytics/,
  customers: /\/api\/admin\/customers/
};

const ADMIN_CACHE_CONFIG = {
  dashboard: { maxAge: 2 * 60 * 1000, strategy: 'stale-while-revalidate' }, // 2 minutes
  orders: { maxAge: 30 * 1000, strategy: 'network-first' }, // 30 seconds
  products: { maxAge: 5 * 60 * 1000, strategy: 'stale-while-revalidate' }, // 5 minutes
  analytics: { maxAge: 10 * 60 * 1000, strategy: 'cache-first' }, // 10 minutes
  customers: { maxAge: 5 * 60 * 1000, strategy: 'stale-while-revalidate' } // 5 minutes
};

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

// Enhanced API request handling with admin-specific caching
async function handleApiRequest(request) {
  const url = new URL(request.url);

  // Check if this is an admin API request
  const adminCacheType = getAdminCacheType(url.pathname);

  if (adminCacheType) {
    return handleAdminApiRequest(request, adminCacheType);
  }

  // Default API handling
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

// Get admin cache type based on URL pattern
function getAdminCacheType(pathname) {
  for (const [type, pattern] of Object.entries(ADMIN_CACHE_PATTERNS)) {
    if (pattern.test(pathname)) {
      return type;
    }
  }
  return null;
}

// Handle admin API requests with specific strategies
async function handleAdminApiRequest(request, cacheType) {
  const config = ADMIN_CACHE_CONFIG[cacheType];
  const cacheName = `admin-${cacheType}-cache`;

  try {
    switch (config.strategy) {
      case 'cache-first':
        return await cacheFirstStrategy(request, cacheName, config.maxAge);
      case 'network-first':
        return await networkFirstStrategy(request, cacheName, config.maxAge);
      case 'stale-while-revalidate':
        return await staleWhileRevalidateStrategy(request, cacheName, config.maxAge);
      default:
        return await networkFirstStrategy(request, cacheName, config.maxAge);
    }
  } catch (error) {
    console.error(`Admin API request failed for ${cacheType}:`, error);

    // Return cached response if available
    const cachedResponse = await caches.match(request, { cacheName });
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response
    return new Response(JSON.stringify({
      offline: true,
      data: getOfflineData(cacheType),
      message: `Offline mode - ${cacheType} data unavailable`
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache strategies
async function cacheFirstStrategy(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse && !isCacheExpired(cachedResponse, maxAge)) {
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

async function networkFirstStrategy(request, cacheName, maxAge) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

async function staleWhileRevalidateStrategy(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Start network request (don't await)
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {});

  // Return cached response if available and fresh
  if (cachedResponse && !isCacheExpired(cachedResponse, maxAge)) {
    return cachedResponse;
  }

  // Return cached response while fetching in background
  if (cachedResponse) {
    fetchPromise; // Let it update cache in background
    return cachedResponse;
  }

  // No cache, wait for network
  return await fetchPromise;
}

// Check if cache is expired
function isCacheExpired(response, maxAge) {
  const cacheDate = new Date(response.headers.get('date') || response.headers.get('sw-cache-date') || 0);
  return Date.now() - cacheDate.getTime() > maxAge;
}

// Get offline data based on cache type
function getOfflineData(cacheType) {
  switch (cacheType) {
    case 'dashboard':
      return {
        overview: { totalOrders: 0, totalRevenue: 0, totalCustomers: 0, totalProducts: 0 },
        recentOrders: [],
        topProducts: []
      };
    case 'orders':
      return [];
    case 'products':
      return [];
    case 'analytics':
      return { customerGrowth: [], salesByCounty: [] };
    case 'customers':
      return [];
    default:
      return [];
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

// Enhanced message handling with admin-specific features
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
      case 'INVALIDATE_ADMIN_CACHE':
        invalidateAdminCache(data.cacheType);
        break;
      case 'PRELOAD_ADMIN_DATA':
        preloadAdminData(data.routes);
        break;
      case 'GET_CACHE_STATS':
        getCacheStats().then(stats => {
          if (event.ports && event.ports[0]) {
            event.ports[0].postMessage({ stats });
          }
        }).catch(error => {
          console.error('Error getting cache stats:', error);
        });
        break;
    }
  } catch (error) {
    console.error('Service worker message handling error:', error);
  }
});

// Admin-specific cache operations
async function invalidateAdminCache(cacheType) {
  try {
    const cacheName = `admin-${cacheType}-cache`;
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    for (const key of keys) {
      await cache.delete(key);
    }

    console.log(`Invalidated admin cache: ${cacheType}`);
  } catch (error) {
    console.error('Failed to invalidate admin cache:', error);
  }
}

async function preloadAdminData(routes) {
  try {
    for (const route of routes) {
      const cacheType = getAdminCacheType(route);
      if (cacheType) {
        const cacheName = `admin-${cacheType}-cache`;
        const cache = await caches.open(cacheName);

        const response = await fetch(route);
        if (response.ok) {
          await cache.put(route, response);
          console.log(`Preloaded admin data: ${route}`);
        }
      }
    }
  } catch (error) {
    console.error('Failed to preload admin data:', error);
  }
}

async function getCacheStats() {
  try {
    const cacheNames = await caches.keys();
    const stats = {};

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      stats[cacheName] = {
        entries: keys.length,
        lastAccess: Date.now()
      };
    }

    return stats;
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return {};
  }
}

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