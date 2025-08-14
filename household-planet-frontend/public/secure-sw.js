// Secure Service Worker with Origin Verification
const CACHE_NAME = 'household-planet-v1';
const ALLOWED_ORIGINS = [
  'https://householdplanet.co.ke',
  'https://www.householdplanet.co.ke',
  'https://api.householdplanet.co.ke'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/offline.html',
        '/manifest.json'
      ]);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event with security checks
self.addEventListener('fetch', (event) => {
  // Only handle requests from allowed origins
  if (!isAllowedOrigin(event.request.url)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Return offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// Message event with origin verification
self.addEventListener('message', (event) => {
  // Verify the origin of the message
  if (!isAllowedOrigin(event.origin)) {
    console.warn('Message from unauthorized origin:', event.origin);
    return;
  }

  // Verify the source
  if (!event.source) {
    console.warn('Message without valid source');
    return;
  }

  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: CACHE_NAME });
      break;
    case 'CLEAR_CACHE':
      clearCache().then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
      break;
    default:
      console.warn('Unknown message type:', type);
  }
});

// Push event for notifications
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    
    // Validate notification data
    if (!isValidNotificationData(data)) {
      console.warn('Invalid notification data received');
      return;
    }

    const options = {
      body: sanitizeText(data.body),
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      tag: sanitizeText(data.tag || 'default'),
      requireInteraction: false,
      actions: data.actions?.map(action => ({
        action: sanitizeText(action.action),
        title: sanitizeText(action.title)
      })) || []
    };

    event.waitUntil(
      self.registration.showNotification(sanitizeText(data.title), options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const notification = event.notification;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Utility functions
function isAllowedOrigin(url) {
  try {
    const urlObj = new URL(url);
    const origin = urlObj.origin;
    
    // Allow same-origin requests
    if (origin === self.location.origin) {
      return true;
    }
    
    // Check against allowed origins list
    return ALLOWED_ORIGINS.includes(origin);
  } catch (error) {
    console.warn('Invalid URL:', url);
    return false;
  }
}

function isValidNotificationData(data) {
  return data && 
         typeof data.title === 'string' && 
         data.title.length > 0 && 
         data.title.length <= 100 &&
         (!data.body || (typeof data.body === 'string' && data.body.length <= 500));
}

function sanitizeText(text) {
  if (typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .substring(0, 200) // Limit length
    .trim();
}

async function clearCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

// Security headers for cached responses
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).then((response) => {
        const newHeaders = new Headers(response.headers);
        newHeaders.set('X-Content-Type-Options', 'nosniff');
        newHeaders.set('X-Frame-Options', 'DENY');
        newHeaders.set('X-XSS-Protection', '1; mode=block');
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      }).catch(() => {
        return caches.match('/offline.html');
      })
    );
  }
});