// Development Service Worker - minimal functionality
const CACHE_NAME = 'household-planet-dev-v1';

self.addEventListener('install', event => {
  console.log('Development Service Worker installing');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Development Service Worker activating');
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // In development, just pass through all requests without caching
  // This prevents caching issues during development
  event.respondWith(
    fetch(event.request).catch(() => {
      // If network fails, return a simple offline response
      if (event.request.mode === 'navigate') {
        return new Response('Offline - Please check your connection', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      throw new Error('Network error');
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});