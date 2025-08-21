'use client';

import { useEffect } from 'react';

interface FontOptimizationProps {
  fonts?: Array<{
    family: string;
    weights?: number[];
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  }>;
}

export function FontOptimization({ fonts = [] }: FontOptimizationProps) {
  useEffect(() => {
    // Apply font-display: swap to all fonts for better performance
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('/fonts/inter-regular.woff2') format('woff2'),
             url('/fonts/inter-regular.woff') format('woff');
      }
      
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 500;
        font-display: swap;
        src: url('/fonts/inter-medium.woff2') format('woff2'),
             url('/fonts/inter-medium.woff') format('woff');
      }
      
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 600;
        font-display: swap;
        src: url('/fonts/inter-semibold.woff2') format('woff2'),
             url('/fonts/inter-semibold.woff') format('woff');
      }
      
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 700;
        font-display: swap;
        src: url('/fonts/inter-bold.woff2') format('woff2'),
             url('/fonts/inter-bold.woff') format('woff');
      }
    `;
    document.head.appendChild(style);

    // Preload critical font files
    const criticalFonts = [
      '/fonts/inter-regular.woff2',
      '/fonts/inter-medium.woff2'
    ];

    criticalFonts.forEach(fontUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = fontUrl;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }, []);

  return null;
}

// System font stack with fallbacks
export const SYSTEM_FONT_STACK = {
  sans: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"'
  ].join(', '),
  
  mono: [
    '"SF Mono"',
    'Monaco',
    'Inconsolata',
    '"Roboto Mono"',
    'Consolas',
    '"Liberation Mono"',
    '"Courier New"',
    'monospace'
  ].join(', ')
};

// CSS for system font optimization
export const FONT_OPTIMIZATION_CSS = `
/* System font stack with performance optimizations */
:root {
  --font-sans: ${SYSTEM_FONT_STACK.sans};
  --font-mono: ${SYSTEM_FONT_STACK.mono};
}

body {
  font-family: var(--font-sans);
  font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1, 'pnum' 1, 'tnum' 0, 'onum' 1, 'lnum' 0, 'dlig' 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Optimize font loading */
.font-loading {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.font-loaded {
  font-family: var(--font-sans);
}

/* Prevent invisible text during font swap */
.font-display-swap {
  font-display: swap;
}

/* Reduce layout shift during font loading */
.font-size-adjust {
  font-size-adjust: 0.5;
}

/* Mobile font optimizations */
@media (max-width: 768px) {
  body {
    /* Slightly larger font size for better mobile readability */
    font-size: 16px;
    line-height: 1.5;
  }
  
  /* Prevent zoom on input focus */
  input, textarea, select {
    font-size: 16px !important;
  }
}

/* High DPI display optimizations */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  body {
    -webkit-font-smoothing: subpixel-antialiased;
  }
}
`;

// Hook for font loading optimization
export function useFontOptimization() {
  useEffect(() => {
    // Check if fonts are loaded
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        document.body.classList.add('font-loaded');
        document.body.classList.remove('font-loading');
      });
    }

    // Add font loading class initially
    document.body.classList.add('font-loading');
  }, []);

  const preloadFont = (fontUrl: string, fontType: string = 'woff2') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = `font/${fontType}`;
    link.href = fontUrl;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  };

  return { preloadFont };
}