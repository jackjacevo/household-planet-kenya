'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Search, Menu, X, Phone, Mail, MapPin, ChevronDown, Heart, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CartDrawer } from '@/components/ecommerce/CartDrawer';
import { SearchAutocomplete } from '@/components/products/SearchAutocomplete';
import { useCart } from '@/hooks/useCart';
import { UserProfile } from '@/components/auth/UserProfile';
import { AuthButtons } from '@/components/auth/AuthButtons';
import { CompanyTagline } from '@/components/ui/CompanyTagline';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [isShopOpen, setIsShopOpen] = useState(false);
  const { getTotalItems } = useCart();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSelect = (product: any) => {
    router.push(`/products/${product.slug}`);
    setIsSearchOpen(false);
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { 
      href: '/products', 
      label: 'Shop',
      hasDropdown: true,
      dropdownItems: [
        { href: '/categories', label: 'All Categories' },
        { href: '/products?category=kitchen', label: 'Kitchen & Dining' },
        { href: '/products?category=bathroom', label: 'Bathroom Accessories' },
        { href: '/products?category=bedroom', label: 'Bedding & Bedroom' },
        { href: '/products?category=decor', label: 'Home Decor' },
        { href: '/products', label: 'All Products' },
      ]
    },
    { href: '/categories', label: 'Categories' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      {/* Top Bar - Now sticky and visible */}
      <div className="sticky top-0 z-50 bg-green-800 text-white py-2 px-4 text-sm w-full">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <span className="flex items-center">
              <Phone className="h-3 w-3 mr-1" /> +254790 227 760
            </span>
            <span className="flex items-center">
              <Mail className="h-3 w-3 mr-1" /> householdplanet819@gmail.com
            </span>
          </div>
          <div className="hidden lg:flex space-x-4">
            <span>Free delivery in Nairobi CBD</span>
            <span>Open: Mon-Sat 8AM-6PM</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`sticky top-[42px] z-40 bg-white w-full transition-all duration-300 ${
        mounted && isScrolled ? 'shadow-md' : 'shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center mr-4 md:mr-8">
            <div className="h-8 w-8 md:h-10 md:w-10 bg-green-600 rounded-full flex items-center justify-center mr-2">
              <span className="text-white font-bold text-sm md:text-lg">H</span>
            </div>
            <div className="hidden xs:block">
              <span className="text-lg md:text-xl font-bold text-green-800 block">
                <span className="hidden sm:inline">Household Planet Kenya</span>
                <span className="sm:hidden">HP Kenya</span>
              </span>
              <CompanyTagline size="sm" className="text-xs md:text-sm text-orange-600 font-medium" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8 ml-8">
            {navItems.map((item) => (
              <div key={item.href} className="relative group">
                {item.hasDropdown ? (
                  <>
                    <button className="text-gray-700 font-medium hover:text-green-600 transition flex items-center">
                      {item.label} <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      {item.dropdownItems?.map((dropItem) => (
                        <Link
                          key={dropItem.href}
                          href={dropItem.href}
                          className="block px-4 py-2 text-gray-800 hover:bg-green-50 hover:text-green-600"
                        >
                          {dropItem.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`font-medium hover:text-green-600 transition ${
                      item.href === '/' ? 'text-green-800' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <SearchAutocomplete onSelect={handleSearchSelect} />
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-700 hover:text-green-600 transition lg:hidden"
            >
              <Search className="h-5 w-5" />
            </button>
            
            <Link 
              href="/wishlist"
              className="p-2 text-gray-700 hover:text-green-600 transition hidden md:block"
            >
              <Heart className="h-5 w-5" />
            </Link>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-700 hover:text-green-600 transition"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
            
            {/* Auth Section - Only render after mount to prevent hydration mismatch */}
            {mounted && (
              <div>
                {loading ? (
                  <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse"></div>
                ) : user ? (
                  <UserProfile />
                ) : (
                  <div className="hidden md:block">
                    <AuthButtons />
                  </div>
                )}
              </div>
            )}
            
            <button
              className="lg:hidden p-2 text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="lg:hidden border-t bg-white p-4 animate-slide-down">
            <SearchAutocomplete onSelect={handleSearchSelect} />
          </div>
        )}
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed top-0 right-0 h-full w-80 max-w-full bg-white shadow-lg z-60 transform transition-transform duration-300 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 flex justify-between items-center border-b">
          <span className="text-lg font-bold text-green-800">Menu</span>
          <button 
            className="text-gray-500 p-2" 
            onClick={() => setIsMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="p-4">
          {navItems.map((item) => (
            <div key={item.href} className="py-3">
              {item.hasDropdown ? (
                <>
                  <button
                    className="flex items-center justify-between w-full text-gray-700 hover:text-green-600 py-2"
                    onClick={() => setIsShopOpen(!isShopOpen)}
                  >
                    <span className="text-base">{item.label}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${
                      isShopOpen ? 'rotate-180' : ''
                    }`} />
                  </button>
                  {isShopOpen && (
                    <div className="pl-4 mt-2 space-y-2">
                      {item.dropdownItems?.map((dropItem) => (
                        <Link
                          key={dropItem.href}
                          href={dropItem.href}
                          className="block py-2 text-gray-600 hover:text-green-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {dropItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className="block text-gray-700 hover:text-green-600 py-2 text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
          <div className="mt-6 pt-4 border-t space-y-3">
            {mounted && (loading ? (
              <div className="flex items-center py-3">
                <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse mr-3"></div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : user ? (
              <>
                <Link 
                  href="/profile" 
                  className="flex items-center py-3 text-gray-700 hover:text-green-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-3" /> 
                  <span>My Profile</span>
                </Link>
                <Link 
                  href="/account" 
                  className="flex items-center py-3 text-gray-700 hover:text-green-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-3" /> 
                  <span>Account Settings</span>
                </Link>
                <Link 
                  href="/account/orders" 
                  className="flex items-center py-3 text-gray-700 hover:text-green-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="h-5 w-5 mr-3" /> 
                  <span>My Orders</span>
                </Link>
                <Link 
                  href="/wishlist" 
                  className="flex items-center py-3 text-gray-700 hover:text-green-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="h-5 w-5 mr-3" /> 
                  <span>Wishlist</span>
                </Link>
                {(user.role === 'ADMIN' || user.role === 'admin') && (
                  <Link 
                    href="/admin/dashboard" 
                    className="flex items-center py-3 text-green-700 hover:text-green-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3" /> 
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center py-3 text-red-600 hover:text-red-700 w-full text-left"
                >
                  <User className="h-5 w-5 mr-3" /> 
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="flex items-center py-3 text-gray-700 hover:text-green-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-3" /> 
                  <span>Login</span>
                </Link>
                <Link 
                  href="/register" 
                  className="flex items-center py-3 text-green-600 hover:text-green-700 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-3" /> 
                  <span>Sign Up</span>
                </Link>
              </>
            ))}
            <div className="pt-4 border-t">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" /> +254790 227 760
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" /> householdplanet819@gmail.com
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
