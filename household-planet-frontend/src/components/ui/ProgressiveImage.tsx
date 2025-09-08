'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { createProgressiveImageLoader, imagePerformanceMonitor } from '@/lib/imageOptimization';
import { getImageUrl } from '@/lib/imageUtils';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes,
  onLoad,
  onError,
}: ProgressiveImageProps) {
  const [lowQualityLoaded, setLowQualityLoaded] = useState(false);
  const [highQualityLoaded, setHighQualityLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const [blurSrc, setBlurSrc] = useState('');
  const imgRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef(createProgressiveImageLoader());

  useEffect(() => {
    const processedSrc = getImageUrl(src);
    
    if (!processedSrc || hasError) return;

    // Start performance monitoring
    imagePerformanceMonitor.startLoading(processedSrc);

    // Load low quality version first
    const lowQualitySrc = loaderRef.current.loadLowQuality(processedSrc);
    setBlurSrc(lowQualitySrc);

    // Preload low quality image
    const lowQualityImg = new Image();
    lowQualityImg.onload = () => {
      setLowQualityLoaded(true);
      
      // Start loading high quality version
      const highQualitySrc = loaderRef.current.loadHighQuality(processedSrc, width);
      setCurrentSrc(highQualitySrc);
    };
    lowQualityImg.onerror = () => {
      setHasError(true);
      onError?.();
    };
    lowQualityImg.src = lowQualitySrc;

  }, [src, width, hasError, onError]);

  const handleHighQualityLoad = () => {
    setHighQualityLoaded(true);
    imagePerformanceMonitor.endLoading(getImageUrl(src));
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate responsive sizes
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
      {!lowQualityLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}

      {/* Low quality blur image */}
      {lowQualityLoaded && !highQualityLoaded && blurSrc && (
        <div className="absolute inset-0">
          <Image
            src={blurSrc}
            alt={alt}
            width={width}
            height={height}
            fill={fill}
            className="object-cover filter blur-sm scale-110 transition-opacity duration-300"
            sizes={responsiveSizes}
            quality={30}
          />
        </div>
      )}

      {/* High quality image */}
      {currentSrc && (
        <Image
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          priority={priority}
          sizes={responsiveSizes}
          className={`object-cover transition-opacity duration-500 ${
            highQualityLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleHighQualityLoad}
          onError={handleError}
          quality={85}
        />
      )}

      {/* Loading indicator */}
      {lowQualityLoaded && !highQualityLoaded && (
        <div className="absolute top-2 right-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin opacity-75" />
        </div>
      )}
    </div>
  );
}