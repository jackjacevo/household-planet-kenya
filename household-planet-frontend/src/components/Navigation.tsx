'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  FiMenu, 
  FiX, 
  FiShoppingCart, 
  FiUser,
  FiSearch,
  FiLogOut
} from 'react-icons/fi';
import Link from 'next/link';
import Button from './ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const { state, fetchCart } = useCart();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const cartItemCount = user ? state.itemCount : state.guestCart.reduce((sum, item) => sum + item.quantity, 0);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Categories', href: '/categories' },
    { name: 'Products', href: '/products' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-xl shadow-lg sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <div className="text-xl sm:text-2xl">🏠</div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 hidden xs:block">
                Household Planet
              </span>
              <span className="text-lg sm:text-xl font-bold text-gray-900 xs:hidden">
                HP Kenya
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium min-h-[44px] flex items-center"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="lg:hidden min-h-[44px] min-w-[44px] p-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg active:bg-gray-100"
                aria-label="Search"
              >
                <FiSearch className="h-5 w-5" />
              </button>

              {/* Cart */}
              <Link 
                href="/cart" 
                className="relative min-h-[44px] min-w-[44px] p-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg active:bg-gray-100 flex items-center justify-center"
                aria-label="Shopping Cart"
              >
                <FiShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
              
              {/* Desktop User Actions */}
              {user ? (
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/dashboard">
                    <Button variant="outline" className="min-h-[44px]">
                      <FiUser className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">{user.firstName}</span>
                    </Button>
                  </Link>
                  <button
                    onClick={logout}
                    className="min-h-[44px] min-w-[44px] p-2 text-gray-700 hover:text-red-600 transition-colors rounded-lg active:bg-gray-100"
                    title="Logout"
                    aria-label="Logout"
                  >
                    <FiLogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link href="/auth/login" className="hidden md:block">
                  <Button variant="outline" className="min-h-[44px]">
                    <FiUser className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden min-h-[44px] min-w-[44px] p-2 text-gray-700 rounded-lg active:bg-gray-100"
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <FiX className="h-6 w-6" />
                ) : (
                  <FiMenu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 py-4 bg-white"
            >
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium rounded-lg mx-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Mobile User Actions */}
                <div className="pt-4 border-t border-gray-200 mx-2">
                  {user ? (
                    <div className="space-y-2">
                      <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full min-h-[44px]" variant="outline">
                          <FiUser className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium rounded-lg transition-colors"
                      >
                        <FiLogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full min-h-[44px]">Sign In</Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
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
            <div className="flex gap-2 mt-4">
              <button className="btn-mobile flex-1 bg-blue-600 text-white">
                Search
              </button>
              <button
                onClick={() => setSearchOpen(false)}
                className="btn-mobile flex-1 bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}