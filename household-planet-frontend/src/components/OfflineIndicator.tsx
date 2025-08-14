'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiWifiOff, FiWifi, FiRefreshCw, FiCheck } from 'react-icons/fi';
import { usePWA } from '@/hooks/usePWA';

export default function OfflineIndicator() {
  const { isOnline, syncData } = usePWA();
  const [showReconnected, setShowReconnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!isOnline && !lastOfflineTime) {
      setLastOfflineTime(new Date());
    } else if (isOnline && lastOfflineTime) {
      setShowReconnected(true);
      setIsSyncing(true);
      
      // Trigger background sync
      syncData('general-sync').then(() => {
        setIsSyncing(false);
        setTimeout(() => {
          setShowReconnected(false);
          setLastOfflineTime(null);
        }, 3000);
      }).catch(() => {
        setIsSyncing(false);
        setTimeout(() => {
          setShowReconnected(false);
          setLastOfflineTime(null);
        }, 3000);
      });
    }
  }, [isOnline, lastOfflineTime, syncData]);

  const getOfflineDuration = () => {
    if (!lastOfflineTime) return '';
    const duration = Math.floor((Date.now() - lastOfflineTime.getTime()) / 1000);
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m`;
    return `${Math.floor(duration / 3600)}h`;
  };

  return (
    <AnimatePresence>
      {/* Offline Indicator */}
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-16 left-0 right-0 bg-orange-500 text-white py-2 px-4 z-40 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
            <FiWifiOff className="w-4 h-4 animate-pulse" />
            <span className="font-medium">You're offline</span>
            {lastOfflineTime && (
              <span className="opacity-75">• {getOfflineDuration()}</span>
            )}
            <span className="hidden sm:inline opacity-75">• Browse cached content</span>
          </div>
        </motion.div>
      )}

      {/* Reconnected Indicator */}
      {showReconnected && isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-16 left-0 right-0 bg-green-500 text-white py-2 px-4 z-40 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
            {isSyncing ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                <span className="font-medium">Back online • Syncing data...</span>
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                <span className="font-medium">Connected • Data synced</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}