'use client';

import { useEffect } from 'react';

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export default function CoreWebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reportMetric = (metric: Metric) => {
      if (process.env.NODE_ENV === 'production') {
        // Send to analytics
      }
      console.log(`${metric.name}: ${metric.value} (${metric.rating})`);
    };

    // LCP Observer
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const value = lastEntry.startTime;
        
        reportMetric({
          name: 'LCP',
          value,
          rating: value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor'
        });
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          const value = entry.processingStart - entry.startTime;
          
          reportMetric({
            name: 'FID',
            value,
            rating: value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor'
          });
        });
      });
      
      fidObserver.observe({ type: 'first-input', buffered: true });

      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        reportMetric({
          name: 'CLS',
          value: clsValue,
          rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor'
        });
      });
      
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    }

    // Font is handled by Next.js font optimization
  }, []);

  return null;
}
