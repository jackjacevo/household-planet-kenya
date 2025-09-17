'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Mobile-specific metrics
  networkType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  
  // Device info
  deviceMemory?: number;
  hardwareConcurrency?: number;
  
  // Battery info
  batteryLevel?: number;
  batteryCharging?: boolean;
}

interface MobilePerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  reportInterval?: number;
}

export function MobilePerformanceMonitor({ 
  onMetricsUpdate, 
  reportInterval = 30000 
}: MobilePerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [shouldOptimize, setShouldOptimize] = useState(false);

  useEffect(() => {
    // Check if device is low-end
    const checkDeviceCapabilities = () => {
      const navigator = window.navigator as any;
      const deviceMemory = navigator.deviceMemory || 4;
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;
      
      const isLowEnd = deviceMemory <= 2 || hardwareConcurrency <= 2;
      setIsLowEndDevice(isLowEnd);
      
      // Check network conditions
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        const slowConnection = connection.effectiveType === 'slow-2g' || 
                              connection.effectiveType === '2g' ||
                              connection.saveData;
        setShouldOptimize(isLowEnd || slowConnection);
      } else {
        setShouldOptimize(isLowEnd);
      }
    };

    checkDeviceCapabilities();
  }, []);

  useEffect(() => {
    let metricsInterval: NodeJS.Timeout;

    const collectMetrics = async () => {
      const newMetrics: PerformanceMetrics = {};

      // Core Web Vitals
      if ('web-vital' in window) {
        // LCP
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          newMetrics.lcp = lcpEntries[lcpEntries.length - 1].startTime;
        }

        // FCP
        const fcpEntries = performance.getEntriesByType('paint');
        const fcpEntry = fcpEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          newMetrics.fcp = fcpEntry.startTime;
        }

        // TTFB
        const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navigationEntries.length > 0) {
          newMetrics.ttfb = navigationEntries[0].responseStart - navigationEntries[0].requestStart;
        }
      }

      // Network Information
      const navigator = window.navigator as any;
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        newMetrics.networkType = connection.type;
        newMetrics.effectiveType = connection.effectiveType;
        newMetrics.downlink = connection.downlink;
        newMetrics.rtt = connection.rtt;
        newMetrics.saveData = connection.saveData;
      }

      // Device capabilities
      newMetrics.deviceMemory = navigator.deviceMemory;
      newMetrics.hardwareConcurrency = navigator.hardwareConcurrency;

      // Battery API
      if ('getBattery' in navigator) {
        try {
          const battery = await navigator.getBattery();
          newMetrics.batteryLevel = battery.level;
          newMetrics.batteryCharging = battery.charging;
        } catch (error) {
          // Battery API not supported
        }
      }

      setMetrics(newMetrics);
      onMetricsUpdate?.(newMetrics);
    };

    // Collect initial metrics
    collectMetrics();

    // Set up periodic collection
    metricsInterval = setInterval(collectMetrics, reportInterval);

    return () => {
      if (metricsInterval) {
        clearInterval(metricsInterval);
      }
    };
  }, [onMetricsUpdate, reportInterval]);

  // Apply performance optimizations based on device capabilities
  useEffect(() => {
    if (shouldOptimize) {
      // Reduce animations
      document.documentElement.classList.add('reduce-animations');
      
      // Disable non-critical features
      document.documentElement.classList.add('low-performance-mode');
      
      // Reduce image quality
      document.documentElement.style.setProperty('--image-quality', '60');
    } else {
      document.documentElement.classList.remove('reduce-animations', 'low-performance-mode');
      document.documentElement.style.removeProperty('--image-quality');
    }
  }, [shouldOptimize]);

  // Monitor memory usage
  useEffect(() => {
    const checkMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMemory = memory.usedJSHeapSize / memory.totalJSHeapSize;
        
        if (usedMemory > 0.8) {
          // High memory usage - trigger cleanup
          console.warn('High memory usage detected:', usedMemory);
          
          // Force garbage collection if available
          if ('gc' in window) {
            (window as any).gc();
          }
          
          // Emit warning event
          window.dispatchEvent(new CustomEvent('high-memory-usage', {
            detail: { usage: usedMemory }
          }));
        }
      }
    };

    const memoryInterval = setInterval(checkMemoryUsage, 10000);
    return () => clearInterval(memoryInterval);
  }, []);

  // Performance observer for additional metrics
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      // Observe layout shifts (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        if (clsValue > 0) {
          setMetrics(prev => ({ ...prev, cls: clsValue }));
        }
      });

      try {
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (error) {
        // Layout shift observer not supported
      }

      // Observe first input delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
        }
      });

      try {
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (error) {
        // First input observer not supported
      }

      return () => {
        clsObserver.disconnect();
        fidObserver.disconnect();
      };
    }
  }, []);

  // Don't render anything - this is a monitoring component
  return null;
}

// Hook for accessing performance metrics
export function useMobilePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<'fast' | 'slow' | 'offline'>('fast');

  useEffect(() => {
    const navigator = window.navigator as any;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    // Check device capabilities
    const deviceMemory = navigator.deviceMemory || 4;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    setIsLowEndDevice(deviceMemory <= 2 || hardwareConcurrency <= 2);

    // Monitor network quality
    const updateNetworkQuality = () => {
      if (!navigator.onLine) {
        setNetworkQuality('offline');
      } else if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setNetworkQuality('slow');
        } else {
          setNetworkQuality('fast');
        }
      }
    };

    updateNetworkQuality();
    
    window.addEventListener('online', updateNetworkQuality);
    window.addEventListener('offline', updateNetworkQuality);
    
    if (connection) {
      connection.addEventListener('change', updateNetworkQuality);
    }

    return () => {
      window.removeEventListener('online', updateNetworkQuality);
      window.removeEventListener('offline', updateNetworkQuality);
      if (connection) {
        connection.removeEventListener('change', updateNetworkQuality);
      }
    };
  }, []);

  const shouldReduceAnimations = isLowEndDevice || networkQuality === 'slow';
  const shouldOptimizeImages = isLowEndDevice || networkQuality !== 'fast';
  const shouldLazyLoad = networkQuality === 'slow' || isLowEndDevice;

  return {
    metrics,
    isLowEndDevice,
    networkQuality,
    shouldReduceAnimations,
    shouldOptimizeImages,
    shouldLazyLoad,
    setMetrics,
  };
}

// Performance optimization utilities
export const MobilePerformanceUtils = {
  // Debounce function for performance
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for performance
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Check if user prefers reduced motion
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Get device pixel ratio
  getDevicePixelRatio: (): number => {
    return window.devicePixelRatio || 1;
  },

  // Check if device is in power save mode
  isInPowerSaveMode: async (): Promise<boolean> => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        return battery.level < 0.2 && !battery.charging;
      } catch {
        return false;
      }
    }
    return false;
  },
};
