'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiX, FiSmartphone } from 'react-icons/fi';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed recently
    const lastDismissed = localStorage.getItem('pwa-install-dismissed');
    if (lastDismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Don't show for 7 days after dismissal
      }
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Smart timing for showing prompt
      const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0') + 1;
      localStorage.setItem('pwa-visit-count', visitCount.toString());
      
      const installPromptShown = localStorage.getItem('pwa-install-prompt-shown');
      
      if (!installPromptShown) {
        // First time: show after user engagement (scroll or 30 seconds)
        const showAfterEngagement = () => {
          setTimeout(() => setShowPrompt(true), 30000);
        };
        
        const showOnScroll = () => {
          if (window.scrollY > 500) {
            setShowPrompt(true);
            window.removeEventListener('scroll', showOnScroll);
          }
        };
        
        window.addEventListener('scroll', showOnScroll);
        showAfterEngagement();
        
      } else if (visitCount >= 3) {
        // Show on 3rd+ visit if not shown recently
        const lastShown = parseInt(installPromptShown);
        const daysSinceLastShown = (Date.now() - lastShown) / (1000 * 60 * 60 * 24);
        if (daysSinceLastShown > 14) {
          setTimeout(() => setShowPrompt(true), 10000);
        }
      }
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-prompt-shown');
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-install-prompt-shown', Date.now().toString());
    } catch (error) {
      console.error('Install prompt failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    localStorage.setItem('pwa-install-prompt-shown', Date.now().toString());
  };

  if (isInstalled || !deferredPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Mobile Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 md:hidden shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiSmartphone className="w-6 h-6 text-blue-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm">
                  🏠 Install Household Planet
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  ✨ Shop offline • 🔔 Get notifications • ⚡ Faster loading • 📱 App-like experience
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleDismiss}
                  className="min-h-[44px] min-w-[44px] p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <FiX size={20} />
                </button>
                <button
                  onClick={handleInstallClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] flex items-center gap-2"
                >
                  <FiDownload size={16} />
                  Install
                </button>
              </div>
            </div>
          </motion.div>

          {/* Desktop Banner */}
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 hidden md:block max-w-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiSmartphone className="w-5 h-5 text-blue-600" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Install Household Planet
                </h3>
                <p className="text-xs text-gray-600">
                  Faster access, offline browsing, and push notifications
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleDismiss}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={16} />
                </button>
                <button
                  onClick={handleInstallClick}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-1"
                >
                  <FiDownload size={14} />
                  Install
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}