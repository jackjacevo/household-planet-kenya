'use client';

import { useEffect } from 'react';

export default function PerformanceOptimizer() {
  useEffect(() => {
    // Enable performance optimizations
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Lazy load non-critical resources
        const lazyResources = [
          '/icons/icon-384x384.png',
          '/icons/icon-512x512.png'
        ];

        lazyResources.forEach(src => {
          const img = new Image();
          img.src = src;
        });
      });
    }

    // Optimize images with intersection observer
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });

    images.forEach(img => imageObserver.observe(img));

    // Prefetch on hover
    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const href = (link as HTMLAnchorElement).href;
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = href;
        document.head.appendChild(prefetchLink);
      }, { once: true });
    });

    return () => {
      imageObserver.disconnect();
    };
  }, []);

  return null;
}