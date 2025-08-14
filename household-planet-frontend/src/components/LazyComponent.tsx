'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export default function LazyComponent({ 
  children, 
  fallback = <div className="h-32 bg-gray-100 animate-pulse rounded" />,
  rootMargin = '100px',
  threshold = 0.1
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Delay loading to improve performance
          setTimeout(() => setIsLoaded(true), 50);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref} style={{ contentVisibility: 'auto', containIntrinsicSize: '300px' }}>
      {isVisible && isLoaded ? children : fallback}
    </div>
  );
}