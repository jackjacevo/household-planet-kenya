'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getDeviceCapabilities, 
  getOptimalImageConfig, 
  createOptimizedImageUrl,
  generateResponsiveSizes,
  preloadCriticalImages,
  LazyImageLoader,
  ImageConfig
} from '@/lib/imageOptimization';
import { getImageUrl } from '@/lib/imageUtils';

export function useImageOptimization() {
  const [capabilities, setCapabilities] = useState(getDeviceCapabilities());
  const [lazyLoader] = useState(() => new LazyImageLoader());

  useEffect(() => {
    // Update capabilities on window resize or network change
    const updateCapabilities = () => {
      setCapabilities(getDeviceCapabilities());
    };

    window.addEventListener('resize', updateCapabilities);
    
    // Listen for network changes if supported
    // @ts-ignore - navigator.connection is experimental
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateCapabilities);
    }

    return () => {
      window.removeEventListener('resize', updateCapabilities);
      if (connection) {
        connection.removeEventListener('change', updateCapabilities);
      }
      lazyLoader.disconnect();
    };
  }, [lazyLoader]);

  const getOptimizedImageProps = useCallback((
    src: string,
    originalWidth: number = 800,
    originalHeight: number = 600,
    targetWidth?: number
  ) => {
    const processedSrc = getImageUrl(src);
    const config = getOptimalImageConfig(originalWidth, originalHeight, targetWidth, capabilities);
    const optimizedSrc = createOptimizedImageUrl(processedSrc, config);
    const sizes = generateResponsiveSizes(config.width || targetWidth || originalWidth);

    return {
      src: optimizedSrc,
      quality: config.quality,
      sizes,
      width: config.width,
      height: config.height,
      priority: false, // Set to true for above-the-fold images
    };
  }, [capabilities]);

  const preloadImages = useCallback((images: Array<{ src: string; config?: Partial<ImageConfig> }>) => {
    preloadCriticalImages(images);
  }, []);

  const enableLazyLoading = useCallback((element: HTMLElement) => {
    lazyLoader.observe(element);
  }, [lazyLoader]);

  const getAdaptiveQuality = useCallback(() => {
    switch (capabilities.connectionSpeed) {
      case 'fast':
        return capabilities.viewportWidth <= 768 ? 80 : 90;
      case 'medium':
        return capabilities.viewportWidth <= 768 ? 70 : 80;
      case 'slow':
        return capabilities.viewportWidth <= 768 ? 55 : 65;
      default:
        return 75;
    }
  }, [capabilities]);

  const shouldUseWebP = useCallback(() => {
    return capabilities.supportsWebP;
  }, [capabilities]);

  const shouldUseAVIF = useCallback(() => {
    return capabilities.supportsAVIF;
  }, [capabilities]);

  const getOptimalFormat = useCallback(() => {
    if (capabilities.supportsAVIF) return 'avif';
    if (capabilities.supportsWebP) return 'webp';
    return 'jpeg';
  }, [capabilities]);

  return {
    capabilities,
    getOptimizedImageProps,
    preloadImages,
    enableLazyLoading,
    getAdaptiveQuality,
    shouldUseWebP,
    shouldUseAVIF,
    getOptimalFormat,
  };
}

// Hook for progressive image loading
export function useProgressiveImage(src: string, targetWidth?: number) {
  const [isLoading, setIsLoading] = useState(true);
  const [lowQualityLoaded, setLowQualityLoaded] = useState(false);
  const [highQualityLoaded, setHighQualityLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getOptimizedImageProps } = useImageOptimization();

  const imageProps = getOptimizedImageProps(src, 800, 600, targetWidth);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setError(null);

    // Load low quality version first
    const lowQualityImg = new Image();
    lowQualityImg.onload = () => {
      setLowQualityLoaded(true);
      
      // Then load high quality version
      const highQualityImg = new Image();
      highQualityImg.onload = () => {
        setHighQualityLoaded(true);
        setIsLoading(false);
      };
      highQualityImg.onerror = () => {
        setError('Failed to load high quality image');
        setIsLoading(false);
      };
      highQualityImg.src = imageProps.src;
    };
    
    lowQualityImg.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
    };
    
    // Load with reduced quality for placeholder
    const lowQualityProps = getOptimizedImageProps(src, 800, 600, targetWidth);
    lowQualityImg.src = lowQualityProps.src;

  }, [src, targetWidth, getOptimizedImageProps, imageProps.src]);

  return {
    ...imageProps,
    isLoading,
    lowQualityLoaded,
    highQualityLoaded,
    error,
  };
}

// Hook for lazy loading with intersection observer
export function useLazyImage(threshold: number = 0.1, rootMargin: string = '50px') {
  const [isInView, setIsInView] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [element, threshold, rootMargin]);

  return { isInView, setElement };
}
