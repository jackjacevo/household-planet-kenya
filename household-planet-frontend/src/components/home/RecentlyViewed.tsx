'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { Product } from '@/types';
import { getRecentlyViewedIds } from '@/lib/recentlyViewed';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function RecentlyViewed() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        // Use localStorage for recently viewed items
        const recentlyViewedItems = getRecentlyViewedIds().slice(0, 6);
        
        if (recentlyViewedItems.length > 0) {
          // Get featured products as recently viewed for now
          try {
            const response = await api.getProducts({ limit: 6, featured: true });
            if (response && Array.isArray(response)) {
              setProducts(response);
            } else if (response?.data && Array.isArray(response.data)) {
              setProducts(response.data);
            }
          } catch (error) {
            console.debug('Could not fetch products');
            setProducts([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch recently viewed:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, [showToast]);

  // Don't render if no products
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">Recently Viewed</h2>
          </div>
          <Link href="/products" className="text-green-600 hover:text-green-700 font-medium">
            View All
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                custom={index}
              >
                <ProductCard product={product} viewMode="grid" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}