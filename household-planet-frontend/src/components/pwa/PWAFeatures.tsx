'use client';

import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Wifi, 
  Bell, 
  Download, 
  Zap, 
  Shield,
  Sync,
  Eye
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useState, useEffect } from 'react';

export function PWAFeatures() {
  const { 
    isInstalled, 
    isOnline, 
    requestNotificationPermission 
  } = usePWA();
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  if (!isClient) return null;

  const features = [
    {
      icon: Smartphone,
      title: 'App Installation',
      description: 'Install as native app',
      status: isInstalled ? 'active' : 'available',
      color: isInstalled ? 'green' : 'blue'
    },
    {
      icon: Wifi,
      title: 'Offline Mode',
      description: 'Browse without internet',
      status: 'active',
      color: 'green'
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      description: 'Order status updates',
      status: notificationPermission === 'granted' ? 'active' : 'available',
      color: notificationPermission === 'granted' ? 'green' : 'orange'
    },
    {
      icon: Sync,
      title: 'Background Sync',
      description: 'Auto-sync cart updates',
      status: 'active',
      color: 'green'
    },
    {
      icon: Zap,
      title: 'Fast Loading',
      description: 'Cached resources',
      status: 'active',
      color: 'green'
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'HTTPS & service worker',
      status: 'active',
      color: 'green'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Eye className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">PWA Features</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          const colorClasses = {
            green: 'bg-green-100 text-green-600 border-green-200',
            blue: 'bg-blue-100 text-blue-600 border-blue-200',
            orange: 'bg-orange-100 text-orange-600 border-orange-200'
          };
          
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border ${colorClasses[feature.color as keyof typeof colorClasses]}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <IconComponent className="h-4 w-4" />
                <span className="text-sm font-medium text-gray-900">
                  {feature.title}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {feature.description}
              </p>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  feature.status === 'active' ? 'bg-green-500' : 'bg-orange-500'
                }`} />
                <span className="text-xs text-gray-500 capitalize">
                  {feature.status}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          🚀 Enhanced with Progressive Web App technology for the best mobile experience
        </p>
      </div>
    </div>
  );
}
