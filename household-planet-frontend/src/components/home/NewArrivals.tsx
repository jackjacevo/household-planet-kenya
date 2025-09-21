'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/products/ProductCard';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { Product } from '@/types';

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

export function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts({ limit: 6, sortBy: 'newest' }) as any;
        if (data && data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        } else if (data && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
          setProducts(data.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.debug('New arrivals API unavailable');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [showToast]);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">New Arrivals</h2>
            <p className="text-gray-600">Fresh products just added to our collection</p>
          </div>
          <Link href="/products?sortBy=createdAt&sortOrder=desc" className="text-green-600 hover:text-green-700 font-semibold flex items-center group">
            View All
            <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {loading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
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
        ) : products.length === 0 ? (
          <motion.div 
            className="col-span-full text-center py-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full p-8 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No New Arrivals Yet</h3>
            <p className="text-gray-600">Fresh products will appear here once added to the store.</p>
          </motion.div>
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
                <ProductCard product={product} viewMode="grid" priority={false} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
