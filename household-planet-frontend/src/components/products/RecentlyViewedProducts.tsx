'use client';

import { useState, useEffect } from 'react';
import { ClockIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface RecentlyViewedItem {
  id: number;
  viewedAt: string;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    images: string[];
    category: {
      name: string;
    };
    brand?: {
      name: string;
    };
    averageRating?: number;
    totalReviews?: number;
  };
}

interface RecentlyViewedProductsProps {
  limit?: number;
  showTitle?: boolean;
  showClearAll?: boolean;
  horizontal?: boolean;
  className?: string;
}

export default function RecentlyViewedProducts({
  limit = 8,
  showTitle = true,
  showClearAll = true,
  horizontal = true,
  className = ''
}: RecentlyViewedProductsProps) {
  const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadRecentlyViewed();
  }, [user]);

  const loadRecentlyViewed = async () => {
    try {
      setLoading(true);
      const sessionId = getSessionId();
      const response = await api.get(`/products/recently-viewed?limit=${limit}`, {
        headers: sessionId ? { 'x-session-id': sessionId } : {}
      });
      setRecentItems(response.data);
    } catch (error) {
      console.error('Error loading recently viewed:', error);
      setRecentItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getSessionId = () => {
    // Get or create session ID for anonymous users
    let sessionId = localStorage.getItem('session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('session-id', sessionId);
    }
    return sessionId;
  };

  const clearAllRecentlyViewed = async () => {
    try {
      // Clear from server (if implemented)
      // await api.delete('/products/recently-viewed');
      
      // Clear from local state
      setRecentItems([]);
      
      // Clear from localStorage for anonymous users
      if (!user) {
        localStorage.removeItem('recently-viewed');
      }
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      // Remove from server (if implemented)
      // await api.delete(`/products/recently-viewed/${itemId}`);
      
      // Remove from local state
      setRecentItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const viewed = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - viewed.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return viewed.toLocaleDateString();
  };

  const formatPrice = (price: number) => {
    return `KSh ${price.toLocaleString()}`;
  };

  if (!isVisible || loading) {
    return loading ? (
      <div className={`space-y-4 ${className}`}>
        {showTitle && <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>}
        <div className={horizontal ? 'flex space-x-4 overflow-hidden' : 'grid grid-cols-2 md:grid-cols-4 gap-4'}>
          {Array.from({ length: Math.min(limit, 4) }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border animate-pulse min-w-[200px]">
              <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null;
  }

  if (recentItems.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Recently Viewed
            </h2>
            <span className="text-sm text-gray-500">
              ({recentItems.length})
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {showClearAll && recentItems.length > 0 && (
              <button
                onClick={clearAllRecentlyViewed}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Products */}
      <div className={
        horizontal 
          ? 'flex space-x-4 overflow-x-auto pb-2 scrollbar-hide' 
          : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
      }>
        {recentItems.map((item) => (
          <div
            key={item.id}
            className={`group bg-white rounded-lg border hover:shadow-md transition-all duration-200 ${
              horizontal ? 'min-w-[200px] flex-shrink-0' : ''
            }`}
          >
            {/* Remove Button */}
            <div className="relative">
              <Link href={`/products/${item.product.slug}`}>
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  <Image
                    src={item.product.images[0] || '/images/placeholder.jpg'}
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  
                  {/* Viewed Badge */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                    <EyeIcon className="w-3 h-3" />
                    <span>{formatTimeAgo(item.viewedAt)}</span>
                  </div>
                </div>
              </Link>
              
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Product Info */}
            <Link href={`/products/${item.product.slug}`}>
              <div className="p-3 space-y-2">
                {/* Category */}
                <div className="text-xs text-gray-500">
                  {item.product.category.name}
                  {item.product.brand && ` • ${item.product.brand.name}`}
                </div>

                {/* Product Name */}
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-green-600 transition-colors">
                  {item.product.name}
                </h3>

                {/* Rating */}
                {item.product.averageRating && (
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-3 h-3 ${
                            star <= Math.round(item.product.averageRating!)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      ({item.product.totalReviews || 0})
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="font-semibold text-green-600 text-sm">
                  {formatPrice(item.product.price)}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {recentItems.length >= limit && (
        <div className="text-center">
          <Link
            href="/products?recently-viewed=true"
            className="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium"
          >
            View All Recently Viewed
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
