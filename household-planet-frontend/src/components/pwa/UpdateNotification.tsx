'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useState } from 'react';

export function UpdateNotification() {
  const { updateAvailable, updateApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!updateAvailable || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
      >
        <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4">
          <div className="flex items-start space-x-3">
            <RefreshCw className="h-5 w-5 mt-0.5 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold mb-1">
                Update Available
              </h3>
              <p className="text-xs text-blue-100 mb-3">
                A new version of the app is ready to install
              </p>
              
              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    try {
                      await updateApp();
                      setIsDismissed(true);
                    } catch (error) {
                      console.error('Failed to update app:', error);
                    }
                  }}
                  className="bg-white text-blue-600 px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-50 transition-colors"
                >
                  Update Now
                </button>
                
                <button
                  onClick={() => {
                    setIsDismissed(true);
                    setTimeout(() => setIsDismissed(false), 3600000);
                  }}
                  className="text-blue-100 hover:text-white px-2 py-1.5 text-xs"
                >
                  Later
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setIsDismissed(true)}
              className="text-blue-200 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
