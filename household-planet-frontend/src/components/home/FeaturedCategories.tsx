'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Kitchen
  'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Bathroom
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Cleaning
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Bedding
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Storage
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'  // Home Decor
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

export function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const fetchCategories = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/categories/hierarchy`;
        console.log('Fetching categories from:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Featured categories raw data:', data);
        console.log('Data type:', typeof data, 'Is array:', Array.isArray(data), 'Length:', data?.length);
        
        if (data && Array.isArray(data) && data.length > 0) {
          // Filter to only show parent categories (main categories)
          const parentCategories = data.filter((cat: any) => !cat.parentId);
          const mappedCategories = parentCategories.slice(0, 6).map((cat: any, index: number) => {
            const categoryImage = cat.image || fallbackImages[index % fallbackImages.length];
            console.log(`Homepage - Category ${cat.name}: image = ${categoryImage}`);
            return {
              id: cat.id.toString(),
              name: cat.name,
              slug: cat.slug,
              description: cat.description || 'Explore our quality products in this category',
              image: categoryImage
            };
          });
          console.log('Homepage - Mapped featured categories:', mappedCategories);
          setCategories(mappedCategories);
        } else {
          console.log('No featured categories data received or invalid format');
          setCategories([]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-green-50/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-40 h-40 bg-green-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Shop by <span className="text-green-600">Category</span>
            </h2>
            <p className="text-gray-600 text-lg">Discover our curated collections for every room</p>
          </div>
          
          <Link 
            href="/categories" 
            className="group flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            View All Categories
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
        
        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Available</h3>
            <p className="text-gray-600">Categories added by admin will appear here.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-6"
          >
            {categories.map((category, index) => (
            <motion.div key={category.slug} variants={itemVariants}>
              <Link 
                href={`/products?category=${category.slug}`} 
                className="group block relative overflow-hidden rounded-2xl h-64 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Image */}
                <div className="absolute inset-0">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    {...(isMounted && { loading: "lazy" })}
                    onError={(e) => {
                      console.log(`Homepage image failed to load for ${category.name}, using fallback`);
                      const target = e.target as HTMLImageElement;
                      target.src = fallbackImages[0];
                    }}
                    onLoad={() => {
                      console.log(`Homepage image loaded successfully for ${category.name}`);
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
                    <h3 className="text-white text-xl font-bold mb-2 group-hover:text-green-100 transition-colors">
                      {category.name}
                    </h3>
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
