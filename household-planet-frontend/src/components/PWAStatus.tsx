'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiWifi, 
  FiWifiOff, 
  FiDownload, 
  FiBell, 
  FiBellOff, 
  FiRefreshCw,
  FiCheck,
  FiX,
  FiSettings
} from 'react-icons/fi';
import { usePWA } from '@/hooks/usePWA';

export default function PWAStatus() {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    isOnline,
    isInstalled,
    hasUpdate,
    pushSupported,
    pushSubscribed,
    updateApp,
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    installApp
  } = usePWA();

  const handleNotificationToggle = async () => {
    if (pushSubscribed) {
      await unsubscribeFromPush();
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        await subscribeToPush();
      }
    }
  };

  return (
    <>
      {/* PWA Status Indicator */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed bottom-20 right-4 md:bottom-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOnline ? (
          <FiWifi className="w-5 h-5" />
        ) : (
          <FiWifiOff className="w-5 h-5" />
        )}
        
        {/* Status Indicators */}
        <div className="absolute -top-1 -right-1 flex flex-col gap-1">
          {hasUpdate && (
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
          )}
          {!isInstalled && (
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
      </motion.button>

      {/* PWA Status Panel */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-30"
              onClick={() => setIsExpanded(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-36 right-4 md:bottom-20 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-40 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-blue-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiSettings className="w-5 h-5" />
                    <h3 className="font-semibold">PWA Status</h3>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 hover:bg-white/20 rounded"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Items */}
              <div className="p-4 space-y-4">
                {/* Connection Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isOnline ? (
                      <FiWifi className="w-5 h-5 text-green-500" />
                    ) : (
                      <FiWifiOff className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">Connection</p>
                      <p className="text-xs text-gray-600">
                        {isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>

                {/* Installation Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isInstalled ? (
                      <FiCheck className="w-5 h-5 text-green-500" />
                    ) : (
                      <FiDownload className="w-5 h-5 text-blue-500" />
                    )}
                    <div>
                      <p className="font-medium text-sm">Installation</p>
                      <p className="text-xs text-gray-600">
                        {isInstalled ? 'Installed' : 'Available'}
                      </p>
                    </div>
                  </div>
                  {!isInstalled && (
                    <button
                      onClick={installApp}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
                    >
                      Install
                    </button>
                  )}
                </div>

                {/* Update Status */}
                {hasUpdate && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FiRefreshCw className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-sm">Update Available</p>
                        <p className="text-xs text-gray-600">New version ready</p>
                      </div>
                    </div>
                    <button
                      onClick={updateApp}
                      className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-medium"
                    >
                      Update
                    </button>
                  </div>
                )}

                {/* Notifications */}
                {pushSupported && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {pushSubscribed ? (
                        <FiBell className="w-5 h-5 text-green-500" />
                      ) : (
                        <FiBellOff className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium text-sm">Notifications</p>
                        <p className="text-xs text-gray-600">
                          {pushSubscribed ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleNotificationToggle}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        pushSubscribed
                          ? 'bg-red-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      {pushSubscribed ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                )}

                {/* Features */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm mb-2">PWA Features</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Offline browsing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Background sync</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Fast loading</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>App shortcuts</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}