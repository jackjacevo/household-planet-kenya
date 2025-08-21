// Resource preloading utilities
export class ResourcePreloader {
  private static preloadedResources = new Set<string>();

  static preloadImage(src: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.preloadedResources.has(src)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.fetchPriority = priority;
      
      link.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      
      link.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
      
      document.head.appendChild(link);
    });
  }

  static preloadFont(href: string, type: string = 'font/woff2'): void {
    if (this.preloadedResources.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = type;
    link.href = href;
    link.crossOrigin = 'anonymous';
    
    document.head.appendChild(link);
    this.preloadedResources.add(href);
  }

  static preloadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.preloadedResources.has(src)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      
      link.onload = () => {
        this.preloadedResources.add(src);
        resolve();
      };
      
      link.onerror = () => reject(new Error(`Failed to preload script: ${src}`));
      
      document.head.appendChild(link);
    });
  }

  static preloadRoute(href: string): void {
    if (this.preloadedResources.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    
    document.head.appendChild(link);
    this.preloadedResources.add(href);
  }

  static preloadCriticalResources(): void {
    // Only preload truly critical resources that are used immediately
    // Removed font and image preloading to avoid unused preload warnings
    
    // Preload critical routes only
    this.preloadRoute('/products');
    this.preloadRoute('/categories');
  }

  static preloadProductImages(products: Array<{ image?: string }>, priority: 'high' | 'low' = 'low'): void {
    // Only preload first 3 images to avoid unused preload warnings
    products.slice(0, 3).forEach(product => {
      if (product.image) {
        this.preloadImage(product.image, priority);
      }
    });
  }
}

// Initialize critical resource preloading
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    ResourcePreloader.preloadCriticalResources();
  });
}