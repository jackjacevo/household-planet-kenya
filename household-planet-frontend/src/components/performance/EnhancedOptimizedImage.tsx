'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getOptimizedImageUrl, generateSrcSet, getMobileImageDimensions } from '@/lib/mobile-image-optimization';

interface EnhancedOptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  fill?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  mobileOptimized?: boolean;
  formats?: ('webp' | 'avif' | 'jpeg')[];
  lazy?: boolean;
  progressive?: boolean;
  threshold?: number;
  rootMargin?: string;
}

export default function EnhancedOptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  mobileOptimized = true,
  formats = ['avif', 'webp', 'jpeg'],
  lazy = true,
  progressive = false,
  threshold = 0.1,
  rootMargin = '50px',
}: EnhancedOptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState(src);
  const [optimalDimensions, setOptimalDimensions] = useState({ width, height });
  const [isVisible, setIsVisible] = useState(!lazy || priority);
  const [supportedFormat, setSupportedFormat] = useState<'avif' | 'webp' | 'jpeg'>('jpeg');
  const [lowQualityLoaded, setLowQualityLoaded] = useState(false);
  const [highQualityLoaded, setHighQualityLoaded] = useState(false);

  // Detect optimal image format
  useEffect(() => {
    const detectFormat = async () => {
      // Check AVIF support
      const avifSupported = await new Promise<boolean>(resolve => {
        const avif = new Image();
        avif.onload = () => resolve(avif.height === 2);
        avif.onerror = () => resolve(false);
        avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
      });

      if (avifSupported) {
        setSupportedFormat('avif');
        return;
      }

      // Check WebP support
      const webpSupported = await new Promise<boolean>(resolve => {
        const webp = new Image();
        webp.onload = () => resolve(webp.height === 2);
        webp.onerror = () => resolve(false);
        webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      });

      setSupportedFormat(webpSupported ? 'webp' : 'jpeg');
    };

    detectFormat();
  }, []);

  // Optimize dimensions for mobile
  useEffect(() => {
    if (mobileOptimized && width && height) {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        const mobileDims = getMobileImageDimensions(width, height, 400);
        setOptimalDimensions(mobileDims);
      }
    }

    // Get optimized image URL
    const optimized = getOptimizedImageUrl(src, {
      width: optimalDimensions.width,
      height: optimalDimensions.height,
      quality,
      format: supportedFormat
    });
    setOptimizedSrc(optimized);
  }, [src, width, height, quality, mobileOptimized, supportedFormat, optimalDimensions.width, optimalDimensions.height]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    const element = document.querySelector(`[data-src="${src}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [lazy, priority, src, threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoading(false);
    if (progressive) {
      setHighQualityLoaded(true);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleLowQualityLoad = () => {
    setLowQualityLoaded(true);
  };

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Image not available</span>
      </div>
    );
  }

  // Generate responsive sizes for mobile optimization
  const responsiveSizes = mobileOptimized 
    ? '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
    : sizes;

  // Low quality image for progressive loading
  const lowQualitySrc = progressive ? getOptimizedImageUrl(src, {
    width: optimalDimensions.width ? Math.floor(optimalDimensions.width / 4) : undefined,
    height: optimalDimensions.height ? Math.floor(optimalDimensions.height / 4) : undefined,
    quality: 20
  }) : '';

  if (!isVisible) {
    return (
      <div 
        className={`animate-pulse bg-gray-200 ${className}`}
        data-src={src}
        style={{ 
          width: optimalDimensions.width, 
          height: optimalDimensions.height 
        }}
      />
    );
  }

  return (
    <div className={`relative ${isLoading ? 'animate-pulse bg-gray-200' : ''} ${className}`}>
      {/* Progressive loading: Low quality placeholder */}
      {progressive && (
        <Image
          src={lowQualitySrc}
          alt={alt}
          width={optimalDimensions.width}
          height={optimalDimensions.height}
          fill={fill}
          className={`transition-opacity duration-300 ${
            lowQualityLoaded && !highQualityLoaded ? 'opacity-100' : 'opacity-0'
          } filter blur-sm absolute inset-0`}
          onLoad={handleLowQualityLoad}
          priority={priority}
        />
      )}
      
      {/* High quality image */}
      <Image
        src={optimizedSrc}
        alt={alt}
        width={optimalDimensions.width}
        height={optimalDimensions.height}
        fill={fill}
        priority={priority}
        sizes={responsiveSizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={`transition-opacity duration-300 ${
          progressive 
            ? (highQualityLoaded ? 'opacity-100' : 'opacity-0')
            : (isLoading ? 'opacity-0' : 'opacity-100')
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
    </div>
  );
}

// Simplified lazy loading image
export function LazyOptimizedImage(props: Omit<EnhancedOptimizedImageProps, 'lazy'>) {
  return <EnhancedOptimizedImage {...props} lazy={true} />;
}

// Progressive loading image
export function ProgressiveOptimizedImage(props: Omit<EnhancedOptimizedImageProps, 'progressive'>) {
  return <EnhancedOptimizedImage {...props} progressive={true} />;
}

// Mobile-first optimized image
export function MobileOptimizedImage(props: Omit<EnhancedOptimizedImageProps, 'mobileOptimized'>) {
  return <EnhancedOptimizedImage {...props} mobileOptimized={true} />;
}