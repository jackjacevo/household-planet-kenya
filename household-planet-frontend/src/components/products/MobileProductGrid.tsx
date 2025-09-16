'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { OptimizedImage } from '../ui/OptimizedImage';
import { Product } from '@/types';

interface MobileProductGridProps {
  products: Product[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

export function MobileProductGrid({ 
  products, 
  loading = false, 
  onLoadMore, 
  hasMore = false,
  className = '' 
}: MobileProductGridProps) {
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const observerRef = useRef<HTMLDivElement>(null);
  const PRODUCTS_PER_PAGE = 6;

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore?.();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  // Update visible products when products change
  useEffect(() => {
    setVisibleProducts(products.slice(0, page * PRODUCTS_PER_PAGE));
  }, [products, page]);

  const loadMoreProducts = () => {
    setPage(prev => prev + 1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile Grid */}
      <motion.div
        className="mobile-grid gap-3 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {visibleProducts.map((product, index) => (
          <motion.div
            key={`${product.id}-${index}`}
            variants={itemVariants}
            className="w-full"
          >
            <ProductCard 
              product={product} 
              viewMode="grid" 
              compact={typeof window !== 'undefined' && window.innerWidth <= 480}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Load More Button - Only show if not using infinite scroll */}
      {!onLoadMore && visibleProducts.length < products.length && (
        <div className="flex justify-center mt-6 px-4">
          <button
            onClick={loadMoreProducts}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200 min-h-touch"
          >
            Load More Products
          </button>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {onLoadMore && hasMore && (
        <div ref={observerRef} className="h-20 flex items-center justify-center">
          {loading && (
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Loading more products...</span>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && !loading && (
        <div className="text-center py-12 px-4">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Loading State */}
      {loading && products.length === 0 && (
        <div className="mobile-grid gap-3 px-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook for mobile-specific product grid behavior
export function useMobileProductGrid(products: Product[]) {
  const [isMobile, setIsMobile] = useState(false);
  const [gridColumns, setGridColumns] = useState(2);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      
      // Adjust grid columns based on screen size
      if (width <= 480) {
        setGridColumns(2);
      } else if (width <= 768) {
        setGridColumns(2);
      } else if (width <= 1024) {
        setGridColumns(3);
      } else {
        setGridColumns(4);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile, gridColumns };
}