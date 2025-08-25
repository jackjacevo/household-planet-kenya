// Quick fix for service worker connection issues
// Run this in browser console or add to your app

// 1. Unregister all service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Unregistered SW:', registration.scope);
    }
  });
}

// 2. Clear all caches
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
      console.log('Deleted cache:', name);
    }
  });
}

// 3. Clear localStorage and sessionStorage
localStorage.clear();
sessionStorage.clear();

console.log('Service worker cleanup complete. Please refresh the page.');