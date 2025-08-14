'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export default function LazyComponent({ 
  children, 
  fallback = <div className="animate-pulse bg-gray-200 h-32 rounded" />,
  rootMargin = '50px',
  threshold = 0.1
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold, hasLoaded]);

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
}