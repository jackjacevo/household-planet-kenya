'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ArrowRight } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUtils';
import { api } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  _count?: { products: number };
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();

        if (data && Array.isArray(data)) {
          // Only show main categories (no parentId) and limit to 6
          const mainCategories = data
            .filter((cat: any) => !cat.parentId && cat.isActive)
            .slice(0, 6);
          setCategories(mainCategories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-8 sm:py-12 lg:py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8 mx-auto"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="h-24 bg-gray-200 rounded-xl mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-8 sm:py-12 lg:py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our wide range of quality products organized for your convenience
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Link href={`/products?category=${category.slug}`}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
                  {/* Category Image */}
                  <div className="w-full h-24 sm:h-28 lg:h-32 overflow-hidden relative">
                    {category.image ? (
                      <img
                        src={getImageUrl(category.image)}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center ${category.image ? 'hidden' : ''}`}>
                      <Package className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-orange-600" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Product count badge */}
                    {category._count?.products && category._count.products > 0 && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {category._count.products}
                      </div>
                    )}
                  </div>

                  {/* Category Info */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 text-center group-hover:text-orange-600 transition-colors line-clamp-2 mb-1">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-xs sm:text-sm text-gray-500 text-center mt-1 line-clamp-2 flex-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Categories Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8 sm:mt-12"
        >
          <Link href="/categories">
            <button className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group">
              <span className="text-sm sm:text-base">View All Categories</span>
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}