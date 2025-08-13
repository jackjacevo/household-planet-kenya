'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiX } from 'react-icons/fi';
import { usePWA } from '@/hooks/usePWA';

export default function PWAUpdateNotification() {
  const { hasUpdate, updateApp } = usePWA();

  const handleUpdate = () => {
    updateApp();
  };

  return (
    <AnimatePresence>
      {hasUpdate && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 md:max-w-md bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <FiRefreshCw className="w-4 h-4" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Update Available</h3>
              <p className="text-xs opacity-90">New features and improvements</p>
            </div>
            
            <button
              onClick={handleUpdate}
              className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium"
            >
              Update
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}