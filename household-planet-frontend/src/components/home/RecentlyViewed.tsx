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
            } else if ((response as any)?.data && Array.isArray((response as any).data)) {
              setProducts((response as any).data);
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
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-4">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Recently Viewed</h2>
              <p className="text-gray-600">Products you've looked at recently</p>
            </div>
          </div>
          <Link href="/products" className="text-green-600 hover:text-green-700 font-semibold flex items-center group">
            View All
            <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {loading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-64 bg-gray-200 animate-pulse" />
                <div className="p-5">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
