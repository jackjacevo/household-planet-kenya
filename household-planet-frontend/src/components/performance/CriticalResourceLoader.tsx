'use client';

import { useEffect } from 'react';
import Head from 'next/head';

interface CriticalResourceLoaderProps {
  criticalCSS?: string;
  preloadFonts?: string[];
  preloadImages?: string[];
  prefetchRoutes?: string[];
}

export default function CriticalResourceLoader({
  criticalCSS,
  preloadFonts = [
    '/fonts/inter-regular.woff2',
    '/fonts/inter-medium.woff2'
  ],
  preloadImages = [
    '/images/logo.svg',
    '/images/hero-mobile.webp'
  ],
  prefetchRoutes = [
    '/products',
    '/cart',
    '/checkout'
  ]
}: CriticalResourceLoaderProps) {
  
  useEffect(() => {
    // Preload critical resources after initial render
    const preloadResource = (href: string, as: string, type?: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (type) link.type = type;
      document.head.appendChild(link);
    };

    // Preload fonts
    preloadFonts.forEach(font => {
      preloadResource(font, 'font', 'font/woff2');
    });

    // Preload critical images
    preloadImages.forEach(image => {
      preloadResource(image, 'image');
    });

    // Prefetch routes after a delay
    setTimeout(() => {
      prefetchRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    }, 2000);

  }, [preloadFonts, preloadImages, prefetchRoutes]);

  return (
    <Head>
      {/* Critical CSS inline */}
      {criticalCSS && (
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
      )}
      
      {/* DNS prefetch for external domains */}
      <link rel="dns-prefetch" href="//images.unsplash.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      
      {/* Preconnect to critical origins */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Resource hints for better mobile performance */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    </Head>
  );
}

// Critical CSS for above-the-fold content
export const criticalCSS = `
  body { margin: 0; font-family: Inter, sans-serif; }
  .header { position: sticky; top: 0; z-index: 50; background: white; }
  .hero { min-height: 50vh; display: flex; align-items: center; }
  .btn-primary { background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; }
  .container { max-width: 1280px; margin: 0 auto; padding: 0 1rem; }
  @media (max-width: 768px) {
    .container { padding: 0 0.75rem; }
    .hero { min-height: 40vh; }
  }
`;
