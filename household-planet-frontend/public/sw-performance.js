// Performance-focused Service Worker
const CACHE_NAME = 'household-planet-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// API endpoints to cache
const API_PATTERNS = [
  /\/api\/products/,
  /\/api\/categories/,
  /\/api\/dashboard\/stats/
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_RESOURCES))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static resources
  event.respondWith(handleStaticRequest(request));
});

async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Network first for API requests
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // Cache first for static resources
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}