'use client';

import { motion } from 'framer-motion';
import { Smartphone, Wifi, WifiOff, Download, Bell, BellOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useState, useEffect } from 'react';

export function PWAStatus() {
  const { 
    isInstalled, 
    isOnline, 
    requestNotificationPermission 
  } = usePWA();
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showStatus, setShowStatus] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    // Show status when app state changes
    setShowStatus(true);
    const timer = setTimeout(() => setShowStatus(false), 3000);
    return () => clearTimeout(timer);
  }, [isInstalled, isOnline, notificationPermission, isClient]);

  const handleNotificationToggle = async () => {
    if (notificationPermission === 'default') {
      try {
        const permission = await requestNotificationPermission();
        setNotificationPermission(permission ? 'granted' : 'denied');
      } catch (error) {
        console.error('Failed to request notification permission:', error);
        setNotificationPermission('denied');
      }
    }
  };

  // Don't render anything until client-side hydration is complete
  if (!isClient) return null;
  
  const shouldShow = showStatus || !isInstalled || !isOnline;
  if (!shouldShow) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-32 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 max-w-xs"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">PWA Status</span>
          <button
            onClick={() => setShowStatus(false)}
            className="text-gray-400 hover:text-gray-600 text-xs"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-1">
          {/* Installation Status */}
          <div className="flex items-center space-x-2">
            <Smartphone className={`h-3 w-3 ${isInstalled ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-xs text-gray-600">
              {isInstalled ? 'Installed' : 'Not Installed'}
            </span>
            {!isInstalled && (
              <Download className="h-3 w-3 text-blue-500" />
            )}
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-orange-500" />
            )}
            <span className="text-xs text-gray-600">
              {isOnline ? 'Online' : 'Offline Mode'}
            </span>
          </div>
          
          {/* Notification Status */}
          <div className="flex items-center space-x-2">
            {notificationPermission === 'granted' ? (
              <Bell className="h-3 w-3 text-green-500" />
            ) : (
              <BellOff className="h-3 w-3 text-gray-400" />
            )}
            <span className="text-xs text-gray-600">
              {notificationPermission === 'granted' 
                ? 'Notifications On' 
                : 'Notifications Off'
              }
            </span>
            {notificationPermission === 'default' && (
              <button
                onClick={handleNotificationToggle}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Enable
              </button>
            )}
          </div>
        </div>
        
        {!isOnline && (
          <div className="mt-2 p-2 bg-orange-50 rounded text-xs text-orange-700">
            You can still browse cached products and manage your cart offline.
          </div>
        )}
      </div>
    </motion.div>
  );
}
