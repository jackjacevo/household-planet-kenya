'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  domContentLoaded: number;
  loadComplete: number;
}

interface PerformanceMonitorProps {
  onMetricsUpdate?: (metrics: Partial<PerformanceMetrics>) => void;
  enableReporting?: boolean;
  reportingEndpoint?: string;
}

export function PerformanceMonitor({
  onMetricsUpdate,
  enableReporting = false,
  reportingEndpoint = '/api/performance'
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});

  useEffect(() => {
    // Core Web Vitals measurement
    const measureWebVitals = () => {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries[entries.length - 1];
        updateMetric('fcp', fcp.startTime);
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1];
        updateMetric('lcp', lcp.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          updateMetric('fid', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            updateMetric('cls', clsValue);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Navigation timing
      const measureNavigationTiming = () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          updateMetric('ttfb', navigation.responseStart - navigation.requestStart);
          updateMetric('domContentLoaded', navigation.domContentLoadedEventEnd - navigation.navigationStart);
          updateMetric('loadComplete', navigation.loadEventEnd - navigation.navigationStart);
        }
      };

      if (document.readyState === 'complete') {
        measureNavigationTiming();
      } else {
        window.addEventListener('load', measureNavigationTiming);
      }
    };

    const updateMetric = (key: keyof PerformanceMetrics, value: number) => {
      setMetrics(prev => {
        const updated = { ...prev, [key]: value };
        onMetricsUpdate?.(updated);
        
        if (enableReporting) {
          reportMetrics(updated);
        }
        
        return updated;
      });
    };

    const reportMetrics = async (metricsData: Partial<PerformanceMetrics>) => {
      try {
        await fetch(reportingEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metrics: metricsData,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now()
          })
        });
      } catch (error) {
        console.warn('Failed to report performance metrics:', error);
      }
    };

    measureWebVitals();
  }, [onMetricsUpdate, enableReporting, reportingEndpoint]);

  return null;
}

// Performance optimization recommendations
export function PerformanceOptimizer() {
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    const analyzePerformance = () => {
      const recs: string[] = [];

      // Check connection type
      const connection = (navigator as any).connection;
      if (connection) {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          recs.push('Detected slow connection - enabling aggressive optimization');
          // Enable more aggressive optimizations
          document.documentElement.classList.add('slow-connection');
        }
      }

      // Check device memory
      const deviceMemory = (navigator as any).deviceMemory;
      if (deviceMemory && deviceMemory < 4) {
        recs.push('Low memory device detected - reducing animations');
        document.documentElement.classList.add('low-memory');
      }

      // Check if user prefers reduced motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        recs.push('Reduced motion preference detected');
        document.documentElement.classList.add('reduce-motion');
      }

      // Check battery status
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          if (battery.level < 0.2 || !battery.charging) {
            recs.push('Low battery detected - enabling power saving mode');
            document.documentElement.classList.add('power-save');
          }
        });
      }

      setRecommendations(recs);
    };

    analyzePerformance();
  }, []);

  return null;
}

// Resource hints manager
export function ResourceHintsManager() {
  useEffect(() => {
    // Preconnect to external domains
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://images.unsplash.com',
      'https://res.cloudinary.com'
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });

    // DNS prefetch for likely next pages
    const prefetchDomains = [
      '//api.householdplanet.co.ke',
      '//cdn.householdplanet.co.ke'
    ];

    prefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

    // Prefetch critical routes
    const criticalRoutes = ['/products', '/cart', '/checkout'];
    
    criticalRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  }, []);

  return null;
}

// Adaptive loading based on device capabilities
export function AdaptiveLoader() {
  useEffect(() => {
    const adaptToDevice = () => {
      const connection = (navigator as any).connection;
      const deviceMemory = (navigator as any).deviceMemory;
      
      // Adaptive image quality
      let imageQuality = 85;
      if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
        imageQuality = 60;
      } else if (connection?.effectiveType === '3g') {
        imageQuality = 75;
      }

      // Adaptive animation settings
      let animationDuration = 300;
      if (deviceMemory && deviceMemory < 4) {
        animationDuration = 150;
      }

      // Apply adaptive settings
      document.documentElement.style.setProperty('--image-quality', imageQuality.toString());
      document.documentElement.style.setProperty('--animation-duration', `${animationDuration}ms`);

      // Adaptive bundle loading
      if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
        // Load minimal bundles only
        document.documentElement.classList.add('minimal-bundles');
      }
    };

    adaptToDevice();

    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', adaptToDevice);
      return () => connection.removeEventListener('change', adaptToDevice);
    }
  }, []);

  return null;
}

// Performance budget monitor
export function PerformanceBudgetMonitor() {
  const [budgetExceeded, setBudgetExceeded] = useState<string[]>([]);

  useEffect(() => {
    const checkBudgets = () => {
      const budgets = {
        fcp: 1800, // 1.8s
        lcp: 2500, // 2.5s
        fid: 100,  // 100ms
        cls: 0.1,  // 0.1
        ttfb: 600  // 600ms
      };

      const exceeded: string[] = [];

      // Check navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        if (ttfb > budgets.ttfb) {
          exceeded.push(`TTFB exceeded: ${Math.round(ttfb)}ms > ${budgets.ttfb}ms`);
        }
      }

      // Check resource timing
      const resources = performance.getEntriesByType('resource');
      const totalSize = resources.reduce((sum, resource: any) => {
        return sum + (resource.transferSize || 0);
      }, 0);

      if (totalSize > 2 * 1024 * 1024) { // 2MB budget
        exceeded.push(`Total resource size exceeded: ${Math.round(totalSize / 1024)}KB > 2MB`);
      }

      setBudgetExceeded(exceeded);

      if (exceeded.length > 0) {
        console.warn('Performance budget exceeded:', exceeded);
      }
    };

    // Check budgets after page load
    if (document.readyState === 'complete') {
      setTimeout(checkBudgets, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(checkBudgets, 1000);
      });
    }
  }, []);

  return null;
}

// Main performance optimization component
export default function PerformanceOptimization() {
  return (
    <>
      <PerformanceMonitor enableReporting={process.env.NODE_ENV === 'production'} />
      <PerformanceOptimizer />
      <ResourceHintsManager />
      <AdaptiveLoader />
      <PerformanceBudgetMonitor />
    </>
  );
}