'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [supportsWebP, setSupportsWebP] = useState(false);

  useEffect(() => {
    // Check WebP support
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const dataURL = canvas.toDataURL('image/webp');
      setSupportsWebP(dataURL.indexOf('data:image/webp') === 0);
    };

    checkWebPSupport();
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Generate optimized src with WebP support
  const getOptimizedSrc = (originalSrc: string) => {
    if (!originalSrc) return '/images/placeholder.jpg';
    
    // If it's already a WebP or external URL, return as is
    if (originalSrc.includes('.webp') || originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // For local images, try to use WebP version if supported
    if (supportsWebP && !originalSrc.includes('.svg')) {
      const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      return webpSrc;
    }

    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(src);

  if (hasError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">Image not available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}

      {/* Optimized Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Image
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          sizes={sizes}
          priority={priority}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          className="object-cover"
          style={fill ? undefined : {
            // Optimize for mobile networks
            imageRendering: typeof window !== 'undefined' && window.innerWidth <= 768 ? 'crisp-edges' : 'auto',
          }}
        />
      </motion.div>
    </div>
  );
}

// Hook for lazy loading images
export function useLazyImage(src: string, threshold = 0.1) {
  const [isInView, setIsInView] = useState(false);
  const [imageRef, setImageRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!imageRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(imageRef);

    return () => observer.disconnect();
  }, [imageRef, threshold]);

  return { isInView, setImageRef };
}