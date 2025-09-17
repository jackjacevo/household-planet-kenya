'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  averageRating?: number;
  totalReviews?: number;
  category: {
    name: string;
  };
  brand?: {
    name: string;
  };
}

interface SmartRecommendationsProps {
  productId?: number;
  userId?: number;
  sessionId?: string;
  type?: 'RELATED' | 'SIMILAR' | 'FREQUENTLY_BOUGHT_TOGETHER' | 'TRENDING';
  title?: string;
  limit?: number;
  showRatings?: boolean;
  className?: string;
}

export default function SmartRecommendations({
  productId,
  userId,
  sessionId,
  type = 'RELATED',
  title,
  limit = 8,
  showRatings = true,
  className = ''
}: SmartRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  useEffect(() => {
    loadRecommendations();
    updateItemsPerView();
    
    const handleResize = () => updateItemsPerView();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [productId, userId, sessionId, type]);

  const updateItemsPerView = () => {
    const width = window.innerWidth;
    if (width < 640) setItemsPerView(1);
    else if (width < 768) setItemsPerView(2);
    else if (width < 1024) setItemsPerView(3);
    else setItemsPerView(4);
  };

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      if (productId) {
        endpoint = `/products/${productId}/recommendations?type=${type}&limit=${limit}`;
      } else if (userId || sessionId) {
        // Get personalized recommendations based on recently viewed
        const recentlyViewed = await api.get(`/products/recently-viewed?limit=5`);
        if ((recentlyViewed as any).data.length > 0) {
          const lastViewedProduct = ((recentlyViewed as any).data as any[])[0].product;
          endpoint = `/products/${lastViewedProduct.id}/recommendations?type=RELATED&limit=${limit}`;
        } else {
          // Fallback to trending products
          endpoint = `/products?featured=true&limit=${limit}`;
        }
      } else {
        // Default to featured products
        endpoint = `/products/featured?limit=${limit}`;
      }

      const response = await api.get(endpoint);
      setProducts(Array.isArray((response as any).data) ? (response as any).data : (response as any).data.products || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + itemsPerView >= products.length ? 0 : prev + itemsPerView
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, products.length - itemsPerView) : Math.max(0, prev - itemsPerView)
    );
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'RELATED':
        return 'Related Products';
      case 'SIMILAR':
        return 'Similar Items';
      case 'FREQUENTLY_BOUGHT_TOGETHER':
        return 'Frequently Bought Together';
      case 'TRENDING':
        return 'Trending Now';
      default:
        return 'Recommended for You';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <StarIconSolid className="w-4 h-4 text-yellow-400" />
            ) : (
              <StarIcon className="w-4 h-4 text-gray-300" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const formatPrice = (price: number) => {
    return `KSh ${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: itemsPerView }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerView);
  const canNavigate = products.length > itemsPerView;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {title || getDefaultTitle()}
        </h2>
        
        {canNavigate && (
          <div className="flex items-center space-x-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
              disabled={currentIndex === 0}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
              disabled={currentIndex + itemsPerView >= products.length}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group bg-white rounded-lg border hover:shadow-lg transition-all duration-200"
          >
            {/* Product Image */}
            <div className="aspect-square relative overflow-hidden rounded-t-lg">
              <Image
                src={product.images[0] || '/images/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
              
              {/* Discount Badge */}
              {product.comparePrice && product.comparePrice > product.price && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4 space-y-2">
              {/* Category & Brand */}
              <div className="text-xs text-gray-500">
                {product.category.name}
                {product.brand && ` • ${product.brand.name}`}
              </div>

              {/* Product Name */}
              <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                {product.name}
              </h3>

              {/* Rating */}
              {showRatings && product.averageRating && (
                <div className="flex items-center space-x-2">
                  {renderStars(Math.round(product.averageRating))}
                  <span className="text-sm text-gray-600">
                    ({product.totalReviews || 0})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-green-600">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Dots Indicator */}
      {canNavigate && (
        <div className="flex justify-center space-x-2 mt-4">
          {Array.from({ length: Math.ceil(products.length / itemsPerView) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * itemsPerView)}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(currentIndex / itemsPerView) === index
                  ? 'bg-green-600'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* View All Link */}
      {products.length >= limit && (
        <div className="text-center mt-6">
          <Link
            href="/products"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            View All Products
          </Link>
        </div>
      )}
    </div>
  );
}
