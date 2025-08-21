'use client';

import { useState, useEffect, ComponentType } from 'react';

interface UseDynamicImportReturn<T> {
  Component: ComponentType<T> | null;
  loading: boolean;
  error: Error | null;
}

export function useDynamicImport<T = any>(
  importFunc: () => Promise<{ default: ComponentType<T> }>
): UseDynamicImportReturn<T> {
  const [component, setComponent] = useState<ComponentType<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { default: Component } = await importFunc();
        
        if (isMounted) {
          setComponent(() => Component);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load component'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
    };
  }, [importFunc]);

  return { Component: component, loading, error };
}

// Preload utility for better UX
export const preloadComponent = (importFunc: () => Promise<any>) => {
  // Start loading the component but don't wait for it
  importFunc().catch(() => {
    // Silently fail - component will be loaded when actually needed
  });
};

// Hook for conditional dynamic imports based on device capabilities
export function useConditionalImport<T = any>(
  mobileImport: () => Promise<{ default: ComponentType<T> }>,
  desktopImport: () => Promise<{ default: ComponentType<T> }>,
  breakpoint: number = 768
): UseDynamicImportReturn<T> {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [breakpoint]);

  return useDynamicImport(isMobile ? mobileImport : desktopImport);
}