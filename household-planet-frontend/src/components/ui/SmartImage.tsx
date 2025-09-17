'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { getImageUrl } from '@/lib/imageUtils';

interface SmartImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function SmartImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  quality,
  sizes,
  onLoad,
  onError,
}: SmartImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState('');
  const [adaptiveQuality, setAdaptiveQuality] = useState(75);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getNetworkQuality = () => {
      // @ts-ignore - navigator.connection is experimental
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (!connection) return 75;
      
      const { effectiveType, downlink } = connection;
      
      // Adjust quality based on network conditions
      if (effectiveType === '4g' && downlink > 10) return 85;
      if (effectiveType === '4g') return 75;
      if (effectiveType === '3g') return 65;
      return 55; // 2g or slower
    };

    const getDeviceQuality = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      const isMobile = window.innerWidth <= 768;
      
      // Lower quality for high DPI mobile devices to save bandwidth
      if (isMobile && pixelRatio > 2) return 70;
      if (isMobile) return 75;
      return 85;
    };

    // Use provided quality or calculate adaptive quality
    const finalQuality = quality || Math.min(getNetworkQuality(), getDeviceQuality());
    setAdaptiveQuality(finalQuality);

    // Generate optimized source URL
    const processedSrc = getImageUrl(src);
    setOptimizedSrc(processedSrc);
  }, [src, quality]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || (
    fill 
      ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
      : width 
        ? `(max-width: 768px) ${Math.min(width, 400)}px, (max-width: 1200px) ${Math.min(width, 600)}px, ${width}px`
        : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  );

  if (hasError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`} ref={imgRef}>
        <div className="text-center text-gray-400 p-4">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}

      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        quality={adaptiveQuality}
        sizes={responsiveSizes}
        className={`transition-opacity duration-300 object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={handleLoad}
        onError={handleError}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
    </div>
  );
}
