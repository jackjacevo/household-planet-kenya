'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, User, Heart, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';

export function MobileNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { getTotalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);
  
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/products', icon: Search, label: 'Search' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', badge: getTotalItems() },
    { href: '/wishlist', icon: Heart, label: 'Wishlist' },
    { href: user ? '/dashboard' : '/login', icon: User, label: user ? 'Account' : 'Login' },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50 md:hidden safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center min-h-touch min-w-touch px-3 py-2 rounded-lg transition-all duration-200 touch-feedback ${
                  isActive 
                    ? 'text-green-600 bg-green-50 scale-105' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Floating Action Button for Menu */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="fixed bottom-20 right-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white p-3 rounded-full shadow-lg z-50 md:hidden transition-all duration-200 touch-feedback min-h-touch min-w-touch"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 md:hidden" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 z-70 mobile-modal max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Handle bar for visual feedback */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors min-h-touch min-w-touch"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/categories"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 touch-feedback min-h-touch"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-green-600 text-xl">📂</span>
                </div>
                <span className="text-sm font-medium text-center">Categories</span>
              </Link>
              
              <Link
                href="/about"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 touch-feedback min-h-touch"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-blue-600 text-xl">ℹ️</span>
                </div>
                <span className="text-sm font-medium text-center">About Us</span>
              </Link>
              
              <Link
                href="/contact"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 touch-feedback min-h-touch"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-orange-600 text-xl">📞</span>
                </div>
                <span className="text-sm font-medium text-center">Contact</span>
              </Link>
              
              <Link
                href="/delivery"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 touch-feedback min-h-touch"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-purple-600 text-xl">🚚</span>
                </div>
                <span className="text-sm font-medium text-center">Delivery</span>
              </Link>
            </div>
            
            {/* Additional quick actions */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-around">
                <a
                  href="https://wa.me/254790227760"
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors min-h-touch"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>💬</span>
                  <span className="text-sm font-medium">WhatsApp</span>
                </a>
                <a
                  href="tel:+254790227760"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-touch"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>📞</span>
                  <span className="text-sm font-medium">Call Us</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
