'use client';

import { useEffect } from 'react';

interface CompressionOptimizationProps {
  enableBrotli?: boolean;
  enableGzip?: boolean;
  enableImageCompression?: boolean;
}

export function CompressionOptimization({
  enableBrotli = true,
  enableGzip = true,
  enableImageCompression = true
}: CompressionOptimizationProps) {
  useEffect(() => {
    // Check compression support
    const checkCompressionSupport = () => {
      const acceptEncoding = navigator.userAgent.includes('Chrome') ? 'br, gzip, deflate' : 'gzip, deflate';
      
      // Add compression headers hint for service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.active?.postMessage({
            type: 'COMPRESSION_SUPPORT',
            acceptEncoding
          });
        });
      }
    };

    checkCompressionSupport();
  }, [enableBrotli, enableGzip]);

  return null;
}

// Asset compression utilities
export const compressionUtils = {
  // Check if browser supports WebP
  supportsWebP: (): Promise<boolean> => {
    return new Promise(resolve => {
      const webP = new Image();
      webP.onload = webP.onerror = () => resolve(webP.height === 2);
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  },

  // Check if browser supports AVIF
  supportsAVIF: (): Promise<boolean> => {
    return new Promise(resolve => {
      const avif = new Image();
      avif.onload = avif.onerror = () => resolve(avif.height === 2);
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  },

  // Get optimal image format
  getOptimalImageFormat: async (): Promise<'avif' | 'webp' | 'jpeg'> => {
    if (await compressionUtils.supportsAVIF()) return 'avif';
    if (await compressionUtils.supportsWebP()) return 'webp';
    return 'jpeg';
  },

  // Compress text content
  compressText: (text: string): string => {
    // Simple text compression (remove extra whitespace)
    return text
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  },

  // Minify CSS
  minifyCSS: (css: string): string => {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Remove last semicolon in blocks
      .replace(/\s*{\s*/g, '{') // Remove spaces around braces
      .replace(/}\s*/g, '}') // Remove spaces after braces
      .replace(/:\s*/g, ':') // Remove spaces after colons
      .replace(/;\s*/g, ';') // Remove spaces after semicolons
      .trim();
  },

  // Minify JavaScript (basic)
  minifyJS: (js: string): string => {
    return js
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Clean up semicolons
      .trim();
  }
};

// Service Worker for compression
export const COMPRESSION_SW_CODE = `
// Service Worker for asset compression
const CACHE_NAME = 'compressed-assets-v1';
const COMPRESSION_CACHE = 'compression-v1';

// Assets to compress and cache
const COMPRESSIBLE_ASSETS = [
  '.js',
  '.css',
  '.html',
  '.json',
  '.svg'
];

// Check if response should be compressed
function shouldCompress(url, contentType) {
  return COMPRESSIBLE_ASSETS.some(ext => url.endsWith(ext)) ||
         (contentType && (
           contentType.includes('text/') ||
           contentType.includes('application/javascript') ||
           contentType.includes('application/json') ||
           contentType.includes('image/svg+xml')
         ));
}

// Compress response using CompressionStream if available
async function compressResponse(response) {
  if (!response.body || !window.CompressionStream) {
    return response;
  }

  const contentType = response.headers.get('content-type') || '';
  
  if (!shouldCompress(response.url, contentType)) {
    return response;
  }

  try {
    const stream = response.body
      .pipeThrough(new CompressionStream('gzip'));
    
    const compressedResponse = new Response(stream, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'content-encoding': 'gzip'
      }
    });

    return compressedResponse;
  } catch (error) {
    console.warn('Compression failed:', error);
    return response;
  }
}

// Fetch event handler
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        
        // Compress and cache the response
        compressResponse(responseToCache).then(compressedResponse => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, compressedResponse);
          });
        });

        return response;
      });
    })
  );
});
`;

// Hook for compression optimization
export function useCompressionOptimization() {
  useEffect(() => {
    // Register service worker for compression
    if ('serviceWorker' in navigator && 'CompressionStream' in window) {
      const swBlob = new Blob([COMPRESSION_SW_CODE], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(swBlob);
      
      navigator.serviceWorker.register(swUrl).catch(error => {
        console.warn('Compression service worker registration failed:', error);
      });
    }

    // Enable compression hints
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Accept-Encoding';
    meta.content = 'br, gzip, deflate';
    document.head.appendChild(meta);
  }, []);

  return {
    compressionUtils,
    supportsCompression: 'CompressionStream' in window
  };
}

// Compression configuration for Next.js
export const COMPRESSION_CONFIG = {
  // Brotli compression settings
  brotli: {
    enabled: true,
    quality: 6, // 0-11, higher = better compression but slower
    lgwin: 22   // 10-24, higher = better compression but more memory
  },

  // Gzip compression settings
  gzip: {
    enabled: true,
    level: 6,   // 1-9, higher = better compression but slower
    threshold: 1024 // Only compress files larger than 1KB
  },

  // File types to compress
  compressibleTypes: [
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'application/json',
    'image/svg+xml',
    'text/xml',
    'application/xml',
    'text/plain'
  ]
};

export default CompressionOptimization;