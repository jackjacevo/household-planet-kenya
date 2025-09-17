'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      const registerServiceWorker = async () => {
        const isDevelopment = process.env.NODE_ENV === 'development'
        
        // In development, skip service worker to avoid connection issues
        if (isDevelopment) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Skipping service worker in development to avoid connection issues');
          }
          return
        }

        // In production, try the full SW first
        try {
          const swResponse = await fetch('/sw.js', { method: 'HEAD' })
          if (swResponse.ok) {
            const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
            if (process.env.NODE_ENV === 'development') {
              console.log('Main SW registered:', registration);
            }
            return
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Main SW not available, trying minimal version:', error);
          }
        }

        try {
          // Fallback to minimal SW
          const minimalResponse = await fetch('/sw-minimal.js', { method: 'HEAD' })
          if (minimalResponse.ok) {
            const registration = await navigator.serviceWorker.register('/sw-minimal.js', { scope: '/' })
            if (process.env.NODE_ENV === 'development') {
              console.log('Minimal SW registered:', registration);
            }
            return
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Minimal SW not available:', error);
          }
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('No service worker files available');
        }
      }

      registerServiceWorker()
    }
  }, [])

  return null
}
