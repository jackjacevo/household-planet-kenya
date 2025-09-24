'use client';

import { useEffect, useRef } from 'react';
import { debugLog } from '@/lib/config/admin-config';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  componentName: string;
}

export const usePerformanceMonitor = (componentName: string) => {
  const startTime = useRef<number>(Date.now());
  const renderStart = useRef<number>(Date.now());

  useEffect(() => {
    const loadTime = Date.now() - startTime.current;
    const renderTime = Date.now() - renderStart.current;

    const metrics: PerformanceMetrics = {
      loadTime,
      renderTime,
      componentName,
    };

    debugLog(`Performance metrics for ${componentName}`, metrics);

    // Log slow components
    if (loadTime > 1000) {
      console.warn(`Slow component detected: ${componentName} took ${loadTime}ms to load`);
    }

    return () => {
      // Cleanup if needed
    };
  }, [componentName]);

  const markRenderStart = () => {
    renderStart.current = Date.now();
  };

  return { markRenderStart };
};