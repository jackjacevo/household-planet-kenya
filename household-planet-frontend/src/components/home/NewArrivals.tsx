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
        const data = await api.getProducts({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }) as any;
        if (data && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
          setProducts(data.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to fetch new arrivals:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load new arrivals'
        });
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [showToast]);

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">New Arrivals</h2>
          <Link href="/products?sortBy=createdAt&sortOrder=desc" className="text-green-600 hover:text-green-700 font-medium">
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
        ) : products.length === 0 ? (
          <motion.div 
            className="text-center py-16 bg-white rounded-3xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-gray-400 to-gray-600 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <span className="text-white text-2xl">✨</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No New Arrivals Yet</h3>
            <p className="text-gray-600">New products will appear here once added.</p>
          </motion.div>
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