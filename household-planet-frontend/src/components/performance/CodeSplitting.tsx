'use client';

import dynamic from 'next/dynamic';
import { Suspense, ComponentType, ReactNode } from 'react';

// Loading fallback component
const LoadingFallback = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    <span className="ml-2 text-gray-600">{message}</span>
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, retry }: { error: Error; retry?: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-red-500 mb-4">
      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
    <p className="text-gray-600 mb-4">{error.message}</p>
    {retry && (
      <button
        onClick={retry}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

// Higher-order component for code splitting
export function withCodeSplitting<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options: {
    loading?: ReactNode;
    error?: ComponentType<{ error: Error; retry: () => void }>;
    ssr?: boolean;
  } = {}
) {
  const {
    loading = <LoadingFallback />,
    error = ErrorFallback,
    ssr = true
  } = options;

  const DynamicComponent = dynamic(importFunc, {
    loading: () => <>{loading}</>,
    ssr
  });

  return function CodeSplitComponent(props: P) {
    return (
      <Suspense fallback={loading}>
        <DynamicComponent {...props} />
      </Suspense>
    );
  };
}

// Lazy load components with intersection observer
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  options: {
    threshold?: number;
    rootMargin?: string;
    fallback?: ReactNode;
  } = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    fallback = <LoadingFallback />
  } = options;

  return function LazyComponent(props: P) {
    return (
      <LazyLoad threshold={threshold} rootMargin={rootMargin} fallback={fallback}>
        <Component {...props} />
      </LazyLoad>
    );
  };
}

// Lazy load wrapper component
function LazyLoad({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  fallback = <LoadingFallback />
}: {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
}

// Pre-built lazy components for common use cases
export const LazyProductGrid = withCodeSplitting(
  () => import('@/components/products/ProductGrid'),
  { loading: <LoadingFallback message="Loading products..." /> }
);

export const LazyImageGallery = withCodeSplitting(
  () => import('@/components/products/ImageGallery'),
  { loading: <LoadingFallback message="Loading gallery..." /> }
);

export const LazyReviews = withCodeSplitting(
  () => import('@/components/products/Reviews'),
  { loading: <LoadingFallback message="Loading reviews..." /> }
);

export const LazyCheckout = withCodeSplitting(
  () => import('@/components/checkout/CheckoutForm'),
  { loading: <LoadingFallback message="Loading checkout..." /> }
);

export const LazyAdminPanel = withCodeSplitting(
  () => import('@/components/admin/AdminPanel'),
  { 
    loading: <LoadingFallback message="Loading admin panel..." />,
    ssr: false // Admin panel doesn't need SSR
  }
);

// Route-based code splitting
export const LazyRoutes = {
  Products: withCodeSplitting(() => import('@/app/products/page')),
  ProductDetail: withCodeSplitting(() => import('@/app/products/[id]/page')),
  Cart: withCodeSplitting(() => import('@/app/cart/page')),
  Checkout: withCodeSplitting(() => import('@/app/checkout/page')),
  Profile: withCodeSplitting(() => import('@/app/profile/page')),
  Admin: withCodeSplitting(() => import('@/app/admin/page'), { ssr: false })
};

// Bundle splitting utilities
export const bundleUtils = {
  // Preload a component
  preloadComponent: (importFunc: () => Promise<any>) => {
    // Trigger the import to start loading
    importFunc().catch(() => {
      // Ignore errors during preloading
    });
  },

  // Preload multiple components
  preloadComponents: (importFuncs: Array<() => Promise<any>>) => {
    importFuncs.forEach(importFunc => {
      bundleUtils.preloadComponent(importFunc);
    });
  },

  // Preload on hover (for better UX)
  preloadOnHover: (element: HTMLElement, importFunc: () => Promise<any>) => {
    let preloaded = false;
    
    const handleMouseEnter = () => {
      if (!preloaded) {
        bundleUtils.preloadComponent(importFunc);
        preloaded = true;
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter, { once: true });
    
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }
};

import { useState, useRef, useEffect } from 'react';