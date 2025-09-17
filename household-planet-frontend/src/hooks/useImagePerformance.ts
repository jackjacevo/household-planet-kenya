'use client';

import { useEffect, useState, useCallback } from 'react';
import { imageOptimizer } from '@/lib/imageOptimization';

interface ImagePerformanceMetrics {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  averageLoadTime: number;
  cacheHitRate: number;
}

export function useImagePerformance() {
  const [metrics, setMetrics] = useState<ImagePerformanceMetrics>({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    cacheHitRate: 0
  });

  const [loadTimes, setLoadTimes] = useState<number[]>([]);

  const trackImageLoad = useCallback((loadTime: number) => {
    setLoadTimes(prev => [...prev, loadTime]);
    setMetrics(prev => ({
      ...prev,
      loadedImages: prev.loadedImages + 1,
      averageLoadTime: [...loadTimes, loadTime].reduce((a, b) => a + b, 0) / (loadTimes.length + 1)
    }));
  }, [loadTimes]);

  const trackImageError = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      failedImages: prev.failedImages + 1
    }));
  }, []);

  const updateCacheStats = useCallback(() => {
    const cacheStats = imageOptimizer.getCacheStats();
    const hitRate = cacheStats.total > 0 ? (cacheStats.loaded / cacheStats.total) * 100 : 0;
    
    setMetrics(prev => ({
      ...prev,
      totalImages: cacheStats.total,
      cacheHitRate: hitRate
    }));
  }, []);

  useEffect(() => {
    // Update cache stats periodically
    const interval = setInterval(updateCacheStats, 5000);
    return () => clearInterval(interval);
  }, [updateCacheStats]);

  useEffect(() => {
    // Clean cache periodically
    const cleanupInterval = setInterval(() => {
      imageOptimizer.cleanCache();
    }, 60000); // Every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    metrics,
    trackImageLoad,
    trackImageError,
    updateCacheStats
  };
}

// Hook for monitoring page performance
export function usePagePerformance() {
  const [performanceData, setPerformanceData] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    // Measure page load time
    const startTime = performance.now();
    
    const measurePerformance = () => {
      const loadTime = performance.now() - startTime;
      
      // Get memory usage if available
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      
      setPerformanceData({
        loadTime,
        renderTime: loadTime,
        memoryUsage: memoryUsage / 1024 / 1024 // Convert to MB
      });
    };

    // Measure after component mounts
    const timeout = setTimeout(measurePerformance, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  return performanceData;
}
