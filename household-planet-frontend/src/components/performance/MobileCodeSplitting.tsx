'use client';

import { lazy, Suspense, ComponentType } from 'react';
import { useDynamicImport } from '@/hooks/useDynamicImport';

interface MobileCodeSplittingProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: any;
}

export default function MobileCodeSplitting({
  component,
  fallback = <div className="animate-pulse bg-gray-200 h-32 w-full rounded" />,
  props = {},
}: MobileCodeSplittingProps) {
  const { Component, loading, error } = useDynamicImport(component);

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Failed to load component
      </div>
    );
  }

  if (loading || !Component) {
    return <>{fallback}</>;
  }

  return <Component {...props} />;
}

// Pre-configured lazy components for common mobile sections
export const LazyProductGrid = lazy(() => import('@/components/products/MobileProductGrid'));
export const LazyCartDrawer = lazy(() => import('@/components/ecommerce/CartDrawer'));
export const LazyCheckoutForm = lazy(() => import('@/components/checkout/MobileCheckoutForm'));
export const LazySearch = lazy(() => import('@/components/search/MobileSearch'));

// Wrapper components with optimized loading states
export function LazyProductGridWrapper(props: any) {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-2 gap-4 p-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-48 rounded-lg" />
        ))}
      </div>
    }>
      <LazyProductGrid {...props} />
    </Suspense>
  );
}

export function LazyCartDrawerWrapper(props: any) {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
        <div className="bg-white w-full h-96 rounded-t-xl animate-pulse" />
      </div>
    }>
      <LazyCartDrawer {...props} />
    </Suspense>
  );
}