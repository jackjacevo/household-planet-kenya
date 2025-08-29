/**
 * Advanced Image Optimization Utilities
 * Optimizes images for performance without compromising quality
 */

export interface ImageConfig {
  quality: number;
  format: 'webp' | 'jpeg' | 'png' | 'auto';
  width?: number;
  height?: number;
  blur?: boolean;
}

export interface DeviceCapabilities {
  pixelRatio: number;
  viewportWidth: number;
  connectionSpeed: 'slow' | 'medium' | 'fast';
  supportsWebP: boolean;
  supportsAVIF: boolean;
}

// Detect device capabilities
export function getDeviceCapabilities(): DeviceCapabilities {
  if (typeof window === 'undefined') {
    return {
      pixelRatio: 1,
      viewportWidth: 1200,
      connectionSpeed: 'medium',
      supportsWebP: false,
      supportsAVIF: false,
    };
  }

  // @ts-ignore - navigator.connection is experimental
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  let connectionSpeed: 'slow' | 'medium' | 'fast' = 'medium';
  
  if (connection) {
    const { effectiveType, downlink } = connection;
    if (effectiveType === '4g' && downlink > 10) connectionSpeed = 'fast';
    else if (effectiveType === '3g' || (effectiveType === '4g' && downlink <= 10)) connectionSpeed = 'medium';
    else connectionSpeed = 'slow';
  }

  return {
    pixelRatio: window.devicePixelRatio || 1,
    viewportWidth: window.innerWidth,
    connectionSpeed,
    supportsWebP: checkWebPSupport(),
    supportsAVIF: checkAVIFSupport(),
  };
}

// Check WebP support
function checkWebPSupport(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// Check AVIF support
function checkAVIFSupport(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  try {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  } catch {
    return false;
  }
}

// Calculate optimal image configuration
export function getOptimalImageConfig(
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  capabilities?: DeviceCapabilities
): ImageConfig {
  const caps = capabilities || getDeviceCapabilities();
  
  // Base quality based on connection speed
  let quality = 75;
  switch (caps.connectionSpeed) {
    case 'fast':
      quality = 85;
      break;
    case 'medium':
      quality = 75;
      break;
    case 'slow':
      quality = 60;
      break;
  }

  // Adjust for mobile devices
  if (caps.viewportWidth <= 768) {
    quality = Math.max(quality - 10, 50);
  }

  // Determine optimal format
  let format: 'webp' | 'jpeg' | 'png' | 'auto' = 'auto';
  if (caps.supportsAVIF) format = 'webp'; // Use WebP as fallback for AVIF
  else if (caps.supportsWebP) format = 'webp';
  else format = 'jpeg';

  // Calculate optimal dimensions
  const maxWidth = targetWidth || Math.min(originalWidth, caps.viewportWidth);
  const aspectRatio = originalHeight / originalWidth;
  
  return {
    quality,
    format,
    width: Math.min(maxWidth * Math.min(caps.pixelRatio, 2), originalWidth),
    height: Math.round(maxWidth * aspectRatio * Math.min(caps.pixelRatio, 2)),
  };
}

// Generate responsive image sizes
export function generateResponsiveSizes(baseWidth: number): string {
  const breakpoints = [320, 480, 768, 1024, 1200, 1920];
  
  return breakpoints
    .filter(bp => bp <= baseWidth * 2) // Don't generate sizes larger than 2x the base
    .map(bp => `(max-width: ${bp}px) ${Math.min(bp, baseWidth)}px`)
    .concat(`${baseWidth}px`)
    .join(', ');
}

// Create optimized image URL
export function createOptimizedImageUrl(
  src: string,
  config: ImageConfig
): string {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  // For Next.js Image component, let it handle optimization
  if (src.startsWith('/') || src.includes(process.env.NEXT_PUBLIC_API_URL || '')) {
    return src;
  }

  // For external images (like Unsplash), add optimization parameters
  if (src.includes('unsplash.com')) {
    const url = new URL(src);
    if (config.width) url.searchParams.set('w', config.width.toString());
    if (config.height) url.searchParams.set('h', config.height.toString());
    url.searchParams.set('q', config.quality.toString());
    url.searchParams.set('fm', config.format === 'auto' ? 'webp' : config.format);
    url.searchParams.set('auto', 'format,compress');
    return url.toString();
  }

  return src;
}

// Preload critical images
export function preloadCriticalImages(images: Array<{ src: string; config?: Partial<ImageConfig> }>): void {
  if (typeof window === 'undefined') return;

  const capabilities = getDeviceCapabilities();
  
  images.forEach(({ src, config = {} }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    
    const optimalConfig = {
      ...getOptimalImageConfig(800, 600, 400, capabilities),
      ...config,
    };
    
    link.href = createOptimizedImageUrl(src, optimalConfig);
    
    // Add responsive preloading for different screen sizes
    if (capabilities.viewportWidth <= 768) {
      link.media = '(max-width: 768px)';
    }
    
    document.head.appendChild(link);
  });
}

// Image lazy loading with intersection observer
export class LazyImageLoader {
  private observer: IntersectionObserver;
  private loadedImages = new Set<string>();

  constructor(options: IntersectionObserverInit = {}) {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      }
    );
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src && !this.loadedImages.has(src)) {
          img.src = src;
          img.classList.remove('lazy-loading');
          img.classList.add('lazy-loaded');
          this.loadedImages.add(src);
          this.observer.unobserve(img);
        }
      }
    });
  }

  observe(element: HTMLElement) {
    this.observer.observe(element);
  }

  disconnect() {
    this.observer.disconnect();
  }
}

// Progressive image loading
export function createProgressiveImageLoader() {
  return {
    loadLowQuality: (src: string) => {
      const capabilities = getDeviceCapabilities();
      const config = getOptimalImageConfig(800, 600, 400, capabilities);
      return createOptimizedImageUrl(src, { ...config, quality: 30, blur: true });
    },
    
    loadHighQuality: (src: string, targetWidth?: number) => {
      const capabilities = getDeviceCapabilities();
      const config = getOptimalImageConfig(800, 600, targetWidth, capabilities);
      return createOptimizedImageUrl(src, config);
    },
  };
}

// Image compression for uploads
export function compressImageFile(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      const { width, height } = calculateOptimalDimensions(
        img.width,
        img.height,
        maxWidth
      );

      canvas.width = width;
      canvas.height = height;

      // Use high-quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Calculate optimal dimensions maintaining aspect ratio
function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number
): { width: number; height: number } {
  if (originalWidth <= maxWidth) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalHeight / originalWidth;
  return {
    width: maxWidth,
    height: Math.round(maxWidth * aspectRatio),
  };
}

// Performance monitoring for images
export class ImagePerformanceMonitor {
  private metrics = new Map<string, { loadTime: number; size: number }>();

  startLoading(src: string) {
    this.metrics.set(src, { loadTime: performance.now(), size: 0 });
  }

  endLoading(src: string, size?: number) {
    const metric = this.metrics.get(src);
    if (metric) {
      metric.loadTime = performance.now() - metric.loadTime;
      if (size) metric.size = size;
    }
  }

  getMetrics() {
    return Array.from(this.metrics.entries()).map(([src, metric]) => ({
      src,
      ...metric,
    }));
  }

  getAverageLoadTime() {
    const times = Array.from(this.metrics.values()).map(m => m.loadTime);
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }
}

// Export singleton instance
export const imagePerformanceMonitor = new ImagePerformanceMonitor();