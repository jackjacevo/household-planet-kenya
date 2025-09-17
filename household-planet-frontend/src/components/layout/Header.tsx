'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Search, Menu, X, Phone, Mail, MapPin, Heart, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import { SearchAutocomplete } from '@/components/products/SearchAutocomplete';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { UserProfile } from '@/components/auth/UserProfile';
import { AuthButtons } from '@/components/auth/AuthButtons';
import { CompanyTagline } from '@/components/ui/CompanyTagline';


export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pathname, setPathname] = useState('');
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  const { getTotalItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  useEffect(() => {
    setMounted(true);
    setPathname(window.location.pathname);
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
    { href: '/products', label: 'Shop' },
    { href: '/categories', label: 'Categories' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      {/* Top Bar - Now sticky and visible */}
      <div className="sticky top-0 z-50 bg-green-800 text-white py-1 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm w-full">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-0.5 sm:space-y-0">
            <span className="flex items-center">
              <Mail className="h-3 w-3 mr-1" /> 
              <span className="hidden sm:inline">householdplanet819@gmail.com</span>
              <span className="sm:hidden">Email us</span>
            </span>
            <span className="flex items-center">
              <Phone className="h-3 w-3 mr-1" /> +254790 227 760
            </span>
          </div>
          <div className="hidden lg:flex space-x-4">
            <span>Free delivery in Nairobi CBD</span>
            <span>Open: Mon-Sat 8AM-6PM</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`sticky top-[34px] sm:top-[42px] z-40 bg-white w-full transition-all duration-300 ${
        mounted && isScrolled ? 'shadow-md' : 'shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center mr-2 sm:mr-4 md:mr-8 flex-shrink-0">
            <img 
              src="/images/logo/hp_logo.jpeg" 
              alt="Household Planet Kenya" 
              className="h-7 w-7 sm:h-8 sm:w-8 md:h-12 md:w-12 rounded-full object-cover mr-1.5 sm:mr-2"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 bg-green-600 rounded-full flex items-center justify-center mr-1.5 sm:mr-2 hidden">
              <span className="text-white font-bold text-xs sm:text-sm md:text-lg">H</span>
            </div>
            <div className="min-w-0">
              <span className="font-bold text-green-800 block leading-tight text-sm sm:text-base md:text-lg">
                <span className="hidden lg:inline">Household Planet Kenya</span>
                <span className="hidden sm:inline lg:hidden">HP Kenya</span>
                <span className="sm:hidden">HP Kenya</span>
              </span>
              <CompanyTagline size="sm" className="text-orange-600 font-medium leading-tight hidden md:block text-xs" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8 ml-8">
            {navItems.map((item) => {
              const isActive = mounted && pathname && (pathname === item.href || 
                (item.href === '/products' && pathname.startsWith('/products')) ||
                (item.href === '/categories' && pathname.startsWith('/categories')));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-medium hover:text-green-600 transition ${
                    isActive ? 'text-green-800 border-b-2 border-green-600 pb-1' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <SearchAutocomplete onSelect={handleSearchSelect} />
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1.5 sm:p-2 text-gray-700 hover:text-green-600 transition lg:hidden"
            >
              <Search className="h-5 w-5" />
            </button>
            
            <Link 
              href="/wishlist"
              className="relative p-1.5 sm:p-2 text-gray-700 hover:text-red-500 transition hidden md:block"
            >
              <Heart className="h-5 w-5" />
              {mounted && wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            
            <Link 
              href="/cart"
              className="relative p-1.5 sm:p-2 text-gray-700 hover:text-green-600 transition"
            >
              <ShoppingCart className="h-5 w-5" />
              {mounted && getTotalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-green-600 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            
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
              className="lg:hidden p-1.5 sm:p-2 text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="lg:hidden border-t bg-white p-3 sm:p-4 animate-slide-down">
            <SearchAutocomplete onSelect={handleSearchSelect} />
          </div>
        )}
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl z-60 transform transition-transform duration-300 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 flex justify-between items-center border-b bg-green-50">
          <span className="text-lg font-bold text-green-800">Menu</span>
          <button 
            className="text-gray-500 p-1.5 hover:bg-gray-100 rounded-full" 
            onClick={() => setIsMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-3">
          {navItems.map((item) => {
            const isActive = mounted && pathname && (pathname === item.href || 
              (item.href === '/products' && pathname.startsWith('/products')) ||
              (item.href === '/categories' && pathname.startsWith('/categories')));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-3 rounded-lg transition-colors text-sm font-medium ${
                  isActive 
                    ? 'bg-green-100 text-green-700 border-l-4 border-green-600' 
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="mt-4 pt-3 border-t space-y-1">
            {mounted && (loading ? (
              <div className="flex items-center py-3">
                <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse mr-3"></div>
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : user ? (
              <>
                <Link 
                  href="/profile" 
                  className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-3" /> 
                  <span>My Profile</span>
                </Link>
                <Link 
                  href="/account/orders" 
                  className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="h-4 w-4 mr-3" /> 
                  <span>My Orders</span>
                </Link>

                <Link 
                  href="/wishlist" 
                  className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="h-4 w-4 mr-3" /> 
                  <span>Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}</span>
                </Link>
                <Link 
                  href="/guest-order-lookup" 
                  className="flex items-center px-3 py-2.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Search className="h-4 w-4 mr-3" /> 
                  <span>Track Order</span>
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
                  className="flex items-center px-3 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 w-full text-left rounded-lg transition-colors text-sm"
                >
                  <User className="h-4 w-4 mr-3" /> 
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-3" /> 
                  <span>Login</span>
                </Link>
                <Link 
                  href="/register" 
                  className="flex items-center px-3 py-2.5 text-green-600 hover:bg-green-50 hover:text-green-700 font-medium rounded-lg transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-3" /> 
                  <span>Sign Up</span>
                </Link>
                <Link 
                  href="/guest-order-lookup" 
                  className="flex items-center px-3 py-2.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Search className="h-4 w-4 mr-3" /> 
                  <span>Track Order</span>
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


    </>
  );
}
