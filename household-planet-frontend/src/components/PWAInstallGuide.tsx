'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiSmartphone, 
  FiMonitor, 
  FiDownload,
  FiShare,
  FiMoreVertical,
  FiChrome
} from 'react-icons/fi';

interface PWAInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PWAInstallGuide({ isOpen, onClose }: PWAInstallGuideProps) {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');

  const detectDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android/.test(userAgent)) return 'android';
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
    return 'desktop';
  };

  const getInstallSteps = () => {
    switch (activeTab) {
      case 'android':
        return [
          {
            icon: <FiChrome className="w-6 h-6" />,
            title: 'Open in Chrome',
            description: 'Make sure you\'re using Chrome browser'
          },
          {
            icon: <FiMoreVertical className="w-6 h-6" />,
            title: 'Tap Menu',
            description: 'Tap the three dots menu in the top right'
          },
          {
            icon: <FiDownload className="w-6 h-6" />,
            title: 'Add to Home Screen',
            description: 'Select "Add to Home screen" from the menu'
          },
          {
            icon: <FiSmartphone className="w-6 h-6" />,
            title: 'Confirm Installation',
            description: 'Tap "Add" to install the app on your home screen'
          }
        ];
      
      case 'ios':
        return [
          {
            icon: <FiShare className="w-6 h-6" />,
            title: 'Tap Share Button',
            description: 'Tap the share button at the bottom of Safari'
          },
          {
            icon: <FiDownload className="w-6 h-6" />,
            title: 'Add to Home Screen',
            description: 'Scroll down and tap "Add to Home Screen"'
          },
          {
            icon: <FiSmartphone className="w-6 h-6" />,
            title: 'Customize Name',
            description: 'Edit the app name if desired, then tap "Add"'
          },
          {
            icon: <FiSmartphone className="w-6 h-6" />,
            title: 'Find on Home Screen',
            description: 'The app will appear on your home screen'
          }
        ];
      
      case 'desktop':
        return [
          {
            icon: <FiChrome className="w-6 h-6" />,
            title: 'Chrome Browser',
            description: 'Open the site in Chrome, Edge, or Firefox'
          },
          {
            icon: <FiDownload className="w-6 h-6" />,
            title: 'Install Prompt',
            description: 'Look for the install button in the address bar'
          },
          {
            icon: <FiMonitor className="w-6 h-6" />,
            title: 'Click Install',
            description: 'Click the install button or use the menu'
          },
          {
            icon: <FiMonitor className="w-6 h-6" />,
            title: 'Launch App',
            description: 'The app will open in its own window'
          }
        ];
      
      default:
        return [];
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white rounded-lg shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Install Household Planet</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Get the full app experience with offline access
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Device Tabs */}
              <div className="flex gap-2 mt-4">
                {[
                  { key: 'android', label: 'Android', icon: FiSmartphone },
                  { key: 'ios', label: 'iOS', icon: FiSmartphone },
                  { key: 'desktop', label: 'Desktop', icon: FiMonitor }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === key
                        ? 'bg-white text-blue-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {getInstallSteps().map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {index + 1}. {step.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Benefits */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">
                  🎉 Benefits of Installing
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 🚀 Faster loading and better performance</li>
                  <li>• 📱 Works offline - browse products without internet</li>
                  <li>• 🔔 Push notifications for orders and deals</li>
                  <li>• 🏠 Easy access from your home screen</li>
                  <li>• 💾 Automatic background sync when online</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Need help? Contact our support team
                </p>
                <button
                  onClick={onClose}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}