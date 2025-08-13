'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiWifiOff, FiWifi } from 'react-icons/fi';
import { usePWA } from '@/hooks/usePWA';

export default function OfflineIndicator() {
  const { isOnline } = usePWA();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-16 left-0 right-0 bg-orange-500 text-white py-2 px-4 z-40"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
            <FiWifiOff className="w-4 h-4" />
            <span>You're offline. Some features may be limited.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}