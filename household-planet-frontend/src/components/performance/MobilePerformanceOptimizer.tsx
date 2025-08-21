'use client';

import { useEffect, useState } from 'react';
import { usePerformance } from '@/hooks/usePerformance';
import MobileImageOptimizer from './MobileImageOptimizer';
import MobileFontOptimizer from './MobileFontOptimizer';
import CriticalResourceLoader from './CriticalResourceLoader';
import MobileAssetOptimizer from './MobileAssetOptimizer';

interface MobilePerformanceOptimizerProps {
  children: React.ReactNode;
  enableLazyLoading?: boolean;
  enableCodeSplitting?: boolean;
  enableImageOptimization?: boolean;
  enableFontOptimization?: boolean;
  enableCriticalCSS?: boolean;
}

export default function MobilePerformanceOptimizer({
  children,
  enableLazyLoading = true,
  enableCodeSplitting = true,
  enableImageOptimization = true,
  enableFontOptimization = true,
  enableCriticalCSS = true,
}: MobilePerformanceOptimizerProps) {
  const { connection, device } = usePerformance();
  const [optimizationsApplied, setOptimizationsApplied] = useState(false);

  useEffect(() => {
    const applyMobileOptimizations = async () => {
      // Apply optimizations based on device and network conditions
      if (device.isMobile || device.isLowEnd) {
        
        // Reduce animations for low-end devices
        if (device.isLowEnd) {
          document.documentElement.classList.add('reduce-motion');
        }

        // Optimize for slow connections
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          // Disable non-critical features
          document.documentElement.style.setProperty('--enable-animations', '0');
          document.documentElement.style.setProperty('--image-quality', '60');
          
          // Enable data saver mode
          if (connection.saveData) {
            document.documentElement.classList.add('data-saver');
          }
        }

        // Apply lazy loading to images
        if (enableLazyLoading) {
          const images = document.querySelectorAll('img[data-src]');
          const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                img.src = img.dataset.src || '';
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
              }
            });
          });

          images.forEach(img => imageObserver.observe(img));
        }

        // Preload critical resources
        const criticalResources = [
          '/fonts/inter-regular.woff2',
          '/images/logo.svg'
        ];

        criticalResources.forEach(resource => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = resource;
          link.as = resource.includes('.woff') ? 'font' : 'image';
          if (resource.includes('.woff')) {
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
          }
          document.head.appendChild(link);
        });

        // Register service worker for caching
        if ('serviceWorker' in navigator) {
          try {
            await navigator.serviceWorker.register('/sw-mobile.js');
          } catch (error) {
            console.log('Service worker registration failed');
          }
        }
      }

      setOptimizationsApplied(true);
    };

    applyMobileOptimizations();
  }, [device, connection, enableLazyLoading]);

  // Show loading state while optimizations are being applied
  if (!optimizationsApplied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Optimizing for your device...</p>
        </div>
      </div>
    );
  }

  return (
    <MobileAssetOptimizer>
      {enableFontOptimization && <MobileFontOptimizer />}
      {enableCriticalCSS && (
        <CriticalResourceLoader
          criticalCSS={criticalCSS}
          preloadFonts={['/fonts/inter-regular.woff2', '/fonts/inter-medium.woff2']}
          preloadImages={['/images/logo.svg', '/images/hero-mobile.webp']}
          prefetchRoutes={['/products', '/cart', '/checkout']}
        />
      )}
      {children}
    </MobileAssetOptimizer>
  );
}

// Critical CSS for mobile
const criticalCSS = `
  /* Mobile-first critical styles */
  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: rgba(0,0,0,0);
  }
  
  body {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  .btn-primary {
    background: #16a34a;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    font-weight: 500;
    min-height: 44px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn-primary:hover {
    background: #15803d;
  }
  
  /* Mobile-specific optimizations */
  @media (max-width: 768px) {
    .container {
      padding: 0 0.75rem;
    }
    
    body {
      font-size: 16px; /* Prevent zoom on iOS */
    }
    
    input, textarea, select {
      font-size: 16px !important;
    }
  }
  
  /* Data saver mode */
  .data-saver img {
    filter: contrast(1.1) brightness(1.1);
  }
  
  .data-saver .animate-pulse,
  .data-saver .animate-bounce,
  .data-saver .animate-spin {
    animation: none !important;
  }
  
  /* Reduced motion */
  .reduce-motion *,
  .reduce-motion *::before,
  .reduce-motion *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
`;

// Performance monitoring utility
export const trackMobilePerformance = () => {
  if (typeof window === 'undefined') return;

  // Track Core Web Vitals
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      // Send to analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'web_vitals', {
          event_category: 'Performance',
          event_label: entry.name,
          value: Math.round(entry.startTime),
          custom_map: {
            metric_name: entry.name,
            metric_value: entry.startTime,
          },
        });
      }
    });
  });

  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
};