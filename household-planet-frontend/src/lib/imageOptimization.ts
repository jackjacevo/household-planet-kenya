// Image optimization utilities for admin dashboard

interface ImageCache {
  [key: string]: {
    loaded: boolean;
    error: boolean;
    timestamp: number;
  };
}

class ImageOptimizer {
  private cache: ImageCache = {};
  private preloadQueue: Set<string> = new Set();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Preload images in the background
  preloadImages(urls: string[]): void {
    urls.forEach(url => {
      if (!url || this.preloadQueue.has(url) || this.isImageCached(url)) return;
      
      this.preloadQueue.add(url);
      
      const img = new Image();
      img.onload = () => {
        this.cache[url] = {
          loaded: true,
          error: false,
          timestamp: Date.now()
        };
        this.preloadQueue.delete(url);
      };
      
      img.onerror = () => {
        this.cache[url] = {
          loaded: false,
          error: true,
          timestamp: Date.now()
        };
        this.preloadQueue.delete(url);
      };
      
      img.src = url;
    });
  }

  // Check if image is cached and valid
  isImageCached(url: string): boolean {
    const cached = this.cache[url];
    if (!cached) return false;
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      delete this.cache[url];
      return false;
    }
    
    return cached.loaded;
  }

  // Get optimized image URL with size parameters
  getOptimizedUrl(url: string, width: number, height: number, quality = 75): string {
    if (!url) return '';
    
    // If it's already a Next.js optimized URL, return as is
    if (url.includes('/_next/image')) return url;
    
    // For external URLs, use Next.js image optimization
    const params = new URLSearchParams({
      url: encodeURIComponent(url),
      w: width.toString(),
      h: height.toString(),
      q: quality.toString()
    });
    
    return `/_next/image?${params.toString()}`;
  }

  // Generate WebP version if supported
  getWebPUrl(url: string): string {
    if (!url || typeof window === 'undefined') return url;
    
    // Check WebP support
    const canvas = document.createElement('canvas');
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    if (!supportsWebP) return url;
    
    // Convert to WebP if possible
    if (url.includes('/_next/image')) {
      return url.replace(/&q=\d+/, '&q=75&f=webp');
    }
    
    return url;
  }

  // Clean expired cache entries
  cleanCache(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach(url => {
      if (now - this.cache[url].timestamp > this.CACHE_DURATION) {
        delete this.cache[url];
      }
    });
  }

  // Get cache stats for debugging
  getCacheStats(): { total: number; loaded: number; errors: number } {
    const entries = Object.values(this.cache);
    return {
      total: entries.length,
      loaded: entries.filter(e => e.loaded).length,
      errors: entries.filter(e => e.error).length
    };
  }
}

// Singleton instance
export const imageOptimizer = new ImageOptimizer();

// Utility functions
export const preloadCategoryImages = (categories: Array<{ image?: string }>) => {
  const urls = categories
    .map(cat => cat.image)
    .filter(Boolean) as string[];
  
  imageOptimizer.preloadImages(urls);
};

export const getOptimizedImageUrl = (url: string, size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 128, height: 128 }
  };
  
  const { width, height } = sizeMap[size];
  return imageOptimizer.getOptimizedUrl(url, width, height);
};

// Intersection Observer for lazy loading
export const createImageObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  if (typeof window === 'undefined') return null;
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px 0px',
    threshold: 0.1
  });
};

// Performance monitoring
export const measureImageLoadTime = (url: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const img = new Image();
    
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      resolve(loadTime);
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };
    
    img.src = url;
  });
};
