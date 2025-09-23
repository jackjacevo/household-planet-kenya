'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Package, ShoppingBag } from 'lucide-react';
import { getImageUrl } from '@/lib/imageUtils';

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
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          // Only show main categories (no parentId)
          const mainCategories = data.filter((cat: any) => !cat.parentId && cat.isActive);
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

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-16 bg-gray-100 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4">
              Shop by Category
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Browse our complete collection organized by category and subcategory
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-2.5 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="w-full px-2 sm:px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 font-medium">
              {filteredCategories.length} Main {filteredCategories.length === 1 ? 'Category' : 'Categories'}
            </span>
          </div>
        </div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5"
        >
          {filteredCategories.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Link href={`/products?category=${category.slug}`}>
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
                  {/* Category Image */}
                  <div className="w-full h-32 sm:h-32 md:h-32 lg:h-32 overflow-hidden relative">
                    {category.image ? (
                      <img 
                        src={getImageUrl(category.image)} 
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center ${category.image ? 'hidden' : ''}`}>
                      <Package className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-blue-600" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Product count badge */}
                    {category._count?.products && category._count.products > 0 && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {category._count.products}
                      </div>
                    )}
                  </div>
                  
                  {/* Category Info */}
                  <div className="p-1.5 sm:p-2 lg:p-3 flex-1 flex flex-col">
                    <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 text-center group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2 flex-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        {filteredCategories.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? `No categories match "${searchTerm}"` : 'No categories available at the moment.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full transition-colors"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}