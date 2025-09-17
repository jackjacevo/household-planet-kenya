'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Zap, ShoppingBag, Wifi } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const INSTALL_MESSAGES = [
  {
    title: "Shop Faster with Our App!",
    description: "Lightning-fast browsing and instant checkout",
    icon: Zap,
    benefits: ["⚡ 3x faster loading", "🛒 One-tap checkout", "📱 Native experience"]
  },
  {
    title: "Never Miss a Deal!",
    description: "Get instant notifications for flash sales and new arrivals",
    icon: ShoppingBag,
    benefits: ["🔔 Flash sale alerts", "🆕 New product updates", "💰 Exclusive app discounts"]
  },
  {
    title: "Shop Even When Offline!",
    description: "Browse products and manage your cart without internet",
    icon: Wifi,
    benefits: ["📱 Offline browsing", "🛒 Offline cart management", "🔄 Auto-sync when online"]
  }
];

export function InstallPrompt() {
  const { isInstallable, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showBenefits, setShowBenefits] = useState(false);

  useEffect(() => {
    if (!isInstallable || isDismissed) return;
    
    // Rotate messages every 5 seconds
    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % INSTALL_MESSAGES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isInstallable, isDismissed]);

  if (!isInstallable || isDismissed) return null;

  const message = INSTALL_MESSAGES[currentMessage];
  const IconComponent = message.icon;

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsDismissed(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:max-w-sm"
      >
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-xl border border-green-200 p-4 backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <motion.div 
              key={currentMessage}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-2 flex-shrink-0 shadow-lg"
            >
              <IconComponent className="h-5 w-5 text-white" />
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <motion.h3 
                key={`title-${currentMessage}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-bold text-gray-900 mb-1"
              >
                {message.title}
              </motion.h3>
              
              <motion.p 
                key={`desc-${currentMessage}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xs text-gray-700 mb-3"
              >
                {message.description}
              </motion.p>
              
              <AnimatePresence>
                {showBenefits && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 space-y-1"
                  >
                    {message.benefits.map((benefit, index) => (
                      <motion.div
                        key={benefit}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-xs text-gray-600 flex items-center"
                      >
                        {benefit}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleInstall}
                  className="flex items-center space-x-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Download className="h-3 w-3" />
                  <span>Install App</span>
                </button>
                
                <button
                  onClick={() => setShowBenefits(!showBenefits)}
                  className="text-green-700 hover:text-green-800 px-2 py-2 text-xs font-medium transition-colors"
                >
                  {showBenefits ? 'Less' : 'Why?'}
                </button>
                
                <button
                  onClick={() => setIsDismissed(true)}
                  className="text-gray-500 hover:text-gray-700 px-2 py-2 text-xs transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setIsDismissed(true)}
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-1 mt-3">
            {INSTALL_MESSAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentMessage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentMessage 
                    ? 'bg-green-600 w-4' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
