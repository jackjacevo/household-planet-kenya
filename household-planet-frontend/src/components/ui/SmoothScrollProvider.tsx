'use client';

import { useEffect } from 'react';
import { initializeSmoothScrolling } from '@/lib/smoothScroll';

export default function SmoothScrollProvider() {
  useEffect(() => {
    // Initialize smooth scrolling on component mount
    initializeSmoothScrolling();
    
    // Add CSS for enhanced smooth scrolling
    const style = document.createElement('style');
    style.textContent = `
      html {
        scroll-behavior: smooth !important;
        scroll-padding-top: 80px;
      }
      
      * {
        scroll-behavior: smooth !important;
      }
      
      body {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }
      
      @media (prefers-reduced-motion: reduce) {
        html, * {
          scroll-behavior: auto !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}