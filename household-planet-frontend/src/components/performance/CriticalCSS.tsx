'use client';

import { useEffect } from 'react';

interface CriticalCSSProps {
  styles: string;
  id?: string;
}

export function CriticalCSS({ styles, id = 'critical-css' }: CriticalCSSProps) {
  useEffect(() => {
    // Only inject if not already present
    if (!document.getElementById(id)) {
      const styleElement = document.createElement('style');
      styleElement.id = id;
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
    }
  }, [styles, id]);

  return null;
}

// Critical CSS for above-the-fold content
export const CRITICAL_CSS = `
/* Critical above-the-fold styles */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  margin: 0;
  padding: 0;
  line-height: 1.6;
  color: #171717;
  background: #ffffff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Header critical styles */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e5e7eb;
  height: 64px;
}

/* Hero section critical styles */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
  color: white;
  text-align: center;
  padding: 2rem 1rem;
}

/* Button critical styles */
.btn-primary {
  background: #16a34a;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-height: 44px;
  min-width: 44px;
}

.btn-primary:hover {
  background: #15803d;
}

/* Mobile navigation critical styles */
@media (max-width: 768px) {
  .mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    background: white;
    border-top: 1px solid #e5e7eb;
    padding: 0.5rem 0;
    height: 64px;
  }
  
  .mobile-nav-item {
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0.25rem;
  }
}

/* Loading states */
.loading {
  background: #f3f4f6;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Container critical styles */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 768px) {
  .container {
    padding: 0 2rem;
  }
}
`;

// Component for injecting critical CSS
export function InlineCriticalCSS() {
  return <CriticalCSS styles={CRITICAL_CSS} />;
}