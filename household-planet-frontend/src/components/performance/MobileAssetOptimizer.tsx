'use client';

import { useEffect, useState } from 'react';
import { usePerformance } from '@/hooks/usePerformance';

interface MobileAssetOptimizerProps {
  children: React.ReactNode;
}

export default function MobileAssetOptimizer({ children }: MobileAssetOptimizerProps) {
  const [isOptimized, setIsOptimized] = useState(false);
  const { connection } = usePerformance();

  useEffect(() => {
    // Optimize based on network conditions
    const optimizeAssets = async () => {
      // Enable compression for slow connections
      if (connection?.effectiveType === '2g' || connection?.effectiveType === '3g') {
        // Reduce image quality
        document.documentElement.style.setProperty('--image-quality', '60');
        
        // Disable non-critical animations
        document.documentElement.classList.add('reduce-motion');
        
        // Lazy load non-critical resources
        const nonCriticalImages = document.querySelectorAll('img[data-lazy]');
        nonCriticalImages.forEach(img => {
          img.setAttribute('loading', 'lazy');
        });
      }

      // Enable service worker for caching
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js');
        } catch (error) {
          console.log('SW registration failed');
        }
      }

      setIsOptimized(true);
    };

    optimizeAssets();
  }, [connection]);

  // Show loading state while optimizing
  if (!isOptimized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

// Asset compression utility
export const compressImage = (file: File, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate optimal dimensions for mobile
      const maxWidth = window.innerWidth > 768 ? 800 : 400;
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/webp', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Minification utility for CSS
export const minifyCSS = (css: string): string => {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/;\s*}/g, '}') // Remove last semicolon
    .replace(/\s*{\s*/g, '{') // Clean braces
    .replace(/;\s*/g, ';') // Clean semicolons
    .trim();
};
