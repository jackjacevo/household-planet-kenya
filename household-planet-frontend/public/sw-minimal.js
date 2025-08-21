// Minimal service worker for basic PWA functionality
const CACHE_NAME = 'household-planet-minimal-v1';

self.addEventListener('install', event => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Let all requests pass through without caching for now
  event.respondWith(fetch(event.request));
});