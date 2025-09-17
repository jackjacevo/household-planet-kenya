'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function OfflineBanner() {
  const { isOnline } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      // Show "back online" message briefly
      setShowBanner(true);
      const timer = setTimeout(() => {
        setShowBanner(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 ${
          isOnline 
            ? 'bg-green-600 text-white' 
            : 'bg-orange-500 text-white'
        } px-4 py-2 text-center text-sm font-medium shadow-lg`}
      >
        <div className="flex items-center justify-center space-x-2">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>Back online! Your cart will sync automatically.</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span>You're offline. Browse cached products and manage your cart.</span>
              <button
                onClick={() => {
                  if (navigator.onLine) {
                    window.location.reload();
                  } else {
                    setTimeout(() => {
                      if (navigator.onLine) {
                        window.location.href = '/';
                      }
                    }, 1000);
                  }
                }}
                className="ml-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded text-xs transition-colors"
              >
                <RefreshCw className="h-3 w-3 inline mr-1" />
                Retry
              </button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
