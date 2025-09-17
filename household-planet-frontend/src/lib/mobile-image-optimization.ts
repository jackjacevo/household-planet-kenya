// Mobile Image Optimization Utilities

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  blur?: boolean;
  progressive?: boolean;
}

export interface ResponsiveImageSizes {
  mobile: string;
  tablet: string;
  desktop: string;
}

// Check if browser supports WebP
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

// Generate optimized image URL
export function getOptimizedImageUrl(
  src: string, 
  options: ImageOptimizationOptions = {}
): string {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  const {
    width,
    height,
    quality = 75,
    format = 'auto',
    blur = false,
    progressive = true
  } = options;

  // For external URLs, return as-is
  if (src.startsWith('http') && !src.includes(process.env.NEXT_PUBLIC_SITE_URL || '')) {
    return src;
  }

  // Build optimization parameters
  const params = new URLSearchParams();
  
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (quality !== 75) params.set('q', quality.toString());
  if (format !== 'auto') params.set('f', format);
  if (blur) params.set('blur', '5');
  if (progressive) params.set('progressive', 'true');

  const queryString = params.toString();
  const separator = src.includes('?') ? '&' : '?';
  
  return queryString ? `${src}${separator}${queryString}` : src;
}

// Generate responsive image sizes
export function getResponsiveImageSizes(
  baseWidth: number = 800
): ResponsiveImageSizes {
  return {
    mobile: `(max-width: 768px) ${Math.min(baseWidth, 400)}px`,
    tablet: `(max-width: 1024px) ${Math.min(baseWidth, 600)}px`,
    desktop: `${baseWidth}px`
  };
}

// Get optimal image dimensions for mobile
export function getMobileImageDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number = 400
): { width: number; height: number } {
  if (originalWidth <= maxWidth) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalHeight / originalWidth;
  return {
    width: maxWidth,
    height: Math.round(maxWidth * aspectRatio)
  };
}

// Generate srcSet for responsive images
export function generateSrcSet(
  src: string,
  widths: number[] = [320, 480, 768, 1024, 1200]
): string {
  return widths
    .map(width => {
      const optimizedUrl = getOptimizedImageUrl(src, { width, quality: 80 });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

// Preload critical images
export function preloadImage(src: string, options: ImageOptimizationOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const optimizedSrc = getOptimizedImageUrl(src, options);
    
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = optimizedSrc;
  });
}

// Lazy load images with Intersection Observer
export function createImageLazyLoader(
  threshold: number = 0.1,
  rootMargin: string = '50px'
) {
  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        }
      });
    },
    { threshold, rootMargin }
  );

  return {
    observe: (img: HTMLImageElement) => imageObserver.observe(img),
    disconnect: () => imageObserver.disconnect()
  };
}

// Compress image on client side (for uploads)
export function compressImage(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      const { width, height } = getMobileImageDimensions(
        img.width,
        img.height,
        maxWidth
      );

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/jpeg',
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

// Get image placeholder (blur data URL)
export function getImagePlaceholder(
  width: number = 10,
  height: number = 10
): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = width;
  canvas.height = height;
  
  // Create a simple gradient placeholder
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

// Mobile-specific image loading strategy
export class MobileImageLoader {
  private static instance: MobileImageLoader;
  private loadedImages = new Set<string>();
  private loadingImages = new Map<string, Promise<void>>();

  static getInstance(): MobileImageLoader {
    if (!MobileImageLoader.instance) {
      MobileImageLoader.instance = new MobileImageLoader();
    }
    return MobileImageLoader.instance;
  }

  async loadImage(src: string, options: ImageOptimizationOptions = {}): Promise<void> {
    const optimizedSrc = getOptimizedImageUrl(src, options);
    
    if (this.loadedImages.has(optimizedSrc)) {
      return Promise.resolve();
    }

    if (this.loadingImages.has(optimizedSrc)) {
      return this.loadingImages.get(optimizedSrc)!;
    }

    const loadPromise = preloadImage(optimizedSrc, options);
    this.loadingImages.set(optimizedSrc, loadPromise);

    try {
      await loadPromise;
      this.loadedImages.add(optimizedSrc);
    } finally {
      this.loadingImages.delete(optimizedSrc);
    }
  }

  isLoaded(src: string, options: ImageOptimizationOptions = {}): boolean {
    const optimizedSrc = getOptimizedImageUrl(src, options);
    return this.loadedImages.has(optimizedSrc);
  }

  preloadCriticalImages(images: Array<{ src: string; options?: ImageOptimizationOptions }>): Promise<void[]> {
    return Promise.all(
      images.map(({ src, options }) => this.loadImage(src, options))
    );
  }
}

// Hook for mobile image optimization
export function useMobileImageOptimization() {
  const loader = MobileImageLoader.getInstance();
  
  return {
    getOptimizedUrl: getOptimizedImageUrl,
    generateSrcSet,
    getResponsiveImageSizes,
    preloadImage: (src: string, options?: ImageOptimizationOptions) => 
      loader.loadImage(src, options),
    isImageLoaded: (src: string, options?: ImageOptimizationOptions) => 
      loader.isLoaded(src, options),
  };
}
