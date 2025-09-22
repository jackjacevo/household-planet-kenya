'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

// Category icons mapping
const categoryIcons: Record<string, string> = {
  'kitchen-dining': '🍽️',
  'home-cleaning': '🧽',
  'bathroom-essentials': '🚿',
  'storage-organization': '📦',
  'laundry-ironing': '👕',
  'home-decor': '🏠',
  'electronics': '⚡',
  'garden-outdoor': '🌱'
};

export function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.getCategories() as any;
        
        if (response && response.categories && Array.isArray(response.categories)) {
          const activeCategories = response.categories
            .filter((cat: Category) => cat.isActive)
            .slice(0, 6);
          setCategories(activeCategories);
        } else if (response && Array.isArray(response)) {
          const activeCategories = response
            .filter((cat: Category) => cat.isActive)
            .slice(0, 6);
          setCategories(activeCategories);
        } else {
          console.log('No categories found in response');
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-600 text-sm sm:text-base">Discover our wide range of household essentials</p>
        </div>
        
        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="p-2 sm:p-4">
                  <div className="w-full h-32 sm:h-40 bg-gray-200 rounded-lg animate-pulse mb-2 sm:mb-4" />
                  <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-gradient-to-r from-orange-400 to-amber-600 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Categories Coming Soon</h3>
              <p className="text-gray-600">We're organizing our products into categories for easier shopping.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="contents"
            >
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    href={`/categories/${category.slug}`} 
                    className="block bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1 w-full"
                  >
                    <div className="relative">
                      <div className="w-full h-32 sm:h-40 lg:h-48 overflow-hidden relative">
                        {category.image ? (
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center ${category.image ? 'hidden' : ''}`}>
                          <div className="text-orange-600 text-center">
                            <div className="text-3xl sm:text-4xl mb-2">
                              {categoryIcons[category.slug] || '📦'}
                            </div>
                            <span className="text-xs font-medium">{category.name}</span>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Product count badge */}
                        {category._count && category._count.products > 0 && (
                          <div className="absolute top-2 right-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {category._count.products}
                          </div>
                        )}
                      </div>
                      <div className="p-2 sm:p-3 lg:p-4">
                        <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 text-center group-hover:text-orange-600 transition-colors line-clamp-2">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
        
        <div className="text-center mt-6 sm:mt-10">
          <Link 
            href="/categories" 
            className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold text-sm sm:text-base transition-colors group"
          >
            View all categories
            <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
