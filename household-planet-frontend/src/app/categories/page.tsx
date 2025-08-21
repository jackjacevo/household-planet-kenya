'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Search, Grid3X3, List, Package, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
];

const defaultCategories: Category[] = [
  {
    id: '1',
    name: 'Kitchen & Dining',
    slug: 'kitchen-dining',
    description: 'Premium cookware, utensils, and dining essentials for your culinary adventures',
    productCount: 45,
  },
  {
    id: '2',
    name: 'Bathroom Accessories',
    slug: 'bathroom-accessories',
    description: 'Luxury bathroom fixtures, towels, and accessories for a spa-like experience',
    productCount: 32,
  },
  {
    id: '3',
    name: 'Bedding & Bedroom',
    slug: 'bedding-bedroom',
    description: 'Comfortable bedding, pillows, and bedroom furniture for restful nights',
    productCount: 28,
  },
  {
    id: '4',
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Stylish decor pieces, artwork, and accessories to beautify your space',
    productCount: 67,
  },
  {
    id: '5',
    name: 'Storage & Organization',
    slug: 'storage-organization',
    description: 'Smart storage solutions and organizers to keep your home tidy',
    productCount: 23,
  },
  {
    id: '6',
    name: 'Cleaning Supplies',
    slug: 'cleaning-supplies',
    description: 'Eco-friendly cleaning products and tools for a spotless home',
    productCount: 19,
  },
  {
    id: '7',
    name: 'Furniture',
    slug: 'furniture',
    description: 'Quality furniture pieces for every room in your home',
    productCount: 41,
  },
  {
    id: '8',
    name: 'Lighting',
    slug: 'lighting',
    description: 'Beautiful lighting solutions to illuminate and enhance your space',
    productCount: 35,
  },
];

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

export default function CategoriesPage() {
  const categoriesWithImages = defaultCategories.map((cat, index) => ({
    ...cat,
    image: fallbackImages[index % fallbackImages.length]
  }));
  
  const [categories, setCategories] = useState<Category[]>(categoriesWithImages);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        console.log('API Response:', data);
        if (data && Array.isArray(data) && data.length > 0) {
          const mappedCategories = data.map((cat: any, index: number) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description || defaultCategories[index % defaultCategories.length]?.description,
            image: fallbackImages[index % fallbackImages.length],
            productCount: Math.floor(Math.random() * 50) + 10
          }));
          setCategories(mappedCategories);
        } else {
          console.log('No API categories, using defaults');
        }
      } catch (error) {
        console.log('API error, using defaults:', error);
      } finally {
        setCategories(prev => prev.map((cat, index) => ({
          ...cat,
          image: cat.image || fallbackImages[index % fallbackImages.length]
        })));
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-40 h-40 bg-green-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl" />
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              All <span className="text-green-600">Categories</span>
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Explore our complete range of home and lifestyle categories
            </motion.p>

            {/* Search Bar */}
            <motion.div
              className="max-w-md mx-auto relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-300 shadow-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Controls */}
      <section className="px-4 pb-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-gray-600" />
                <span className="text-gray-600 font-medium">
                  {loading ? 'Loading...' : `${filteredCategories.length} categories`}
                </span>
              </div>

              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-md text-green-600'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-white shadow-md text-green-600'
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid/List */}
      <section className="px-4 pb-16">
        <div className="container mx-auto max-w-7xl">
          {loading ? (
            <motion.div 
              className="flex flex-col justify-center items-center h-64 bg-white rounded-3xl shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-full p-4 mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <p className="text-gray-600 font-medium">Loading categories...</p>
            </motion.div>
          ) : filteredCategories.length === 0 ? (
            <motion.div 
              className="text-center py-16 bg-white rounded-3xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-gradient-to-r from-gray-400 to-gray-600 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Search className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Categories Found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Clear Search
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1 max-w-4xl mx-auto'
              }`}
            >
              {filteredCategories.map((category, index) => (
                <motion.div key={category.slug} variants={itemVariants}>
                  {viewMode === 'grid' ? (
                    <Link 
                      href={`/products?category=${category.slug}`} 
                      className="group block relative overflow-hidden rounded-2xl h-80 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                    >
                      {/* Image */}
                      <div className="absolute inset-0">
                        <img 
                          src={category.image || fallbackImages[0]} 
                          alt={category.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading={index < 4 ? "eager" : "lazy"}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = fallbackImages[0];
                          }}
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      
                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white text-xl font-bold group-hover:text-green-100 transition-colors">
                              {category.name}
                            </h3>
                            <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-2 py-1 rounded-full">
                              {category.productCount} items
                            </span>
                          </div>
                          <p className="text-gray-200 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                            {category.description}
                          </p>
                        </div>
                        
                        {/* Arrow Icon */}
                        <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      
                      {/* Border Effect */}
                      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/30 transition-colors duration-300" />
                    </Link>
                  ) : (
                    <Link 
                      href={`/products?category=${category.slug}`}
                      className="group flex items-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden mr-6">
                        <img 
                          src={category.image || fallbackImages[0]} 
                          alt={category.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = fallbackImages[0];
                          }}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                            {category.name}
                          </h3>
                          <span className="bg-green-100 text-green-600 text-sm px-3 py-1 rounded-full font-medium">
                            {category.productCount} items
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{category.description}</p>
                        <div className="flex items-center text-green-600 font-medium">
                          <span>Shop Now</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}