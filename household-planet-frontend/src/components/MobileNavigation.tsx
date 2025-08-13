'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  FiHome, 
  FiSearch, 
  FiShoppingCart, 
  FiUser,
  FiGrid,
  FiMessageCircle
} from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { usePathname } from 'next/navigation';

export default function MobileNavigation() {
  const { user } = useAuth();
  const { state } = useCart();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const cartItemCount = user ? state.itemCount : state.guestCart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Categories', href: '/products', icon: FiGrid },
    { name: 'Search', href: '#', icon: FiSearch, action: () => setSearchOpen(true) },
    { name: 'Cart', href: '/cart', icon: FiShoppingCart, badge: cartItemCount },
    { name: user ? 'Account' : 'Login', href: user ? '/dashboard' : '/auth/login', icon: FiUser },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="mobile-nav md:hidden">
        <div className="flex justify-around items-center py-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={item.action}
                className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 px-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600 active:bg-gray-100'
                }`}
              >
                <div className="relative">
                  <Icon size={20} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/254700000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fab bg-green-500 hover:bg-green-600 md:hidden"
        aria-label="Contact us on WhatsApp"
      >
        <FiMessageCircle size={24} />
      </a>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="bg-white p-4 m-4 rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="input-mobile w-full pl-12 pr-4"
                autoFocus
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={() => setSearchOpen(false)}
              className="btn-mobile w-full mt-4 bg-gray-100 text-gray-700"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}