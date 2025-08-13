'use client';

import { useEffect } from 'react';

export default function ResourcePreloader() {
  useEffect(() => {
    // Preload critical resources
    const preloadResources = [
      { href: '/icons/icon-192x192.png', as: 'image' },
      { href: '/api/products?limit=12', as: 'fetch', crossOrigin: 'anonymous' },
      { href: '/api/categories', as: 'fetch', crossOrigin: 'anonymous' }
    ];

    preloadResources.forEach(({ href, as, crossOrigin }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (crossOrigin) link.crossOrigin = crossOrigin;
      document.head.appendChild(link);
    });

    // Prefetch next likely pages
    const prefetchPages = ['/products', '/cart', '/auth/login'];
    
    prefetchPages.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });

    // Preconnect to external domains
    const preconnectDomains = ['https://fonts.googleapis.com', 'https://api.householdplanet.co.ke'];
    
    preconnectDomains.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }, []);

  return null;
}