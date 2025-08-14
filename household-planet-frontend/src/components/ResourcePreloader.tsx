'use client';

import { useEffect } from 'react';

export default function ResourcePreloader() {
  useEffect(() => {
    // Preload critical resources with priority
    const preloadResources = [
      { href: '/icons/icon-192x192.png', as: 'image', priority: 'high' },
      { href: '/api/products?limit=6', as: 'fetch', crossOrigin: 'anonymous', priority: 'high' },
      { href: '/api/categories', as: 'fetch', crossOrigin: 'anonymous', priority: 'low' }
    ];

    preloadResources.forEach(({ href, as, crossOrigin, priority }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (crossOrigin) link.crossOrigin = crossOrigin;
      if (priority) link.fetchPriority = priority;
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
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'http://localhost:3001'
    ];
    
    preconnectDomains.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      if (href.includes('fonts')) link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // DNS prefetch for better performance
    const dnsPrefetch = ['//householdplanet.co.ke'];
    dnsPrefetch.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  return null;
}