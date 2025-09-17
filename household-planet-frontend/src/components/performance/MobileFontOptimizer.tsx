'use client';

import { useEffect } from 'react';
import Head from 'next/head';

interface MobileFontOptimizerProps {
  enableSystemFallback?: boolean;
  preloadFonts?: string[];
}

export default function MobileFontOptimizer({
  enableSystemFallback = true,
  preloadFonts = [
    '/fonts/inter-regular.woff2',
    '/fonts/inter-medium.woff2'
  ]
}: MobileFontOptimizerProps) {

  useEffect(() => {
    // Detect if device supports font-display: swap
    const supportsSwap = CSS.supports('font-display', 'swap');
    
    if (supportsSwap) {
      // Add font-display: swap to existing fonts
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url('/fonts/inter-regular.woff2') format('woff2');
        }
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 500;
          font-display: swap;
          src: url('/fonts/inter-medium.woff2') format('woff2');
        }
      `;
      document.head.appendChild(style);
    }

    // Preload critical fonts
    preloadFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Apply system font fallback for slow connections
    if (enableSystemFallback) {
      const connection = (navigator as any).connection;
      if (connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')) {
        document.documentElement.style.setProperty(
          '--font-family', 
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        );
      }
    }
  }, [enableSystemFallback, preloadFonts]);

  return (
    <Head>
      {/* System font fallback CSS */}
      <style>{`
        :root {
          --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        body {
          font-family: var(--font-family);
        }
        
        /* Optimize font rendering */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
        
        /* Reduce font weight on low-end devices */
        @media (max-device-width: 480px) and (max-device-height: 854px) {
          body {
            font-weight: 400;
          }
          
          h1, h2, h3, h4, h5, h6 {
            font-weight: 500;
          }
        }
        
        /* Optimize line height for mobile reading */
        @media (max-width: 768px) {
          body {
            line-height: 1.6;
          }
          
          p {
            line-height: 1.7;
          }
        }
      `}</style>
      
      {/* Preconnect to font CDNs */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Font loading optimization */}
      <link 
        rel="preload" 
        href="/fonts/inter-regular.woff2" 
        as="font" 
        type="font/woff2" 
        crossOrigin="anonymous"
      />
      <link 
        rel="preload" 
        href="/fonts/inter-medium.woff2" 
        as="font" 
        type="font/woff2" 
        crossOrigin="anonymous"
      />
    </Head>
  );
}

// Font loading utility
export const loadFont = (fontFamily: string, fontUrl: string, fontWeight = '400') => {
  return new Promise((resolve, reject) => {
    const font = new FontFace(fontFamily, `url(${fontUrl})`, {
      weight: fontWeight,
      display: 'swap'
    });
    
    font.load().then(() => {
      document.fonts.add(font);
      resolve(font);
    }).catch(reject);
  });
};

// Critical font CSS for inline injection
export const criticalFontCSS = `
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url('/fonts/inter-regular.woff2') format('woff2');
  }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
`;
