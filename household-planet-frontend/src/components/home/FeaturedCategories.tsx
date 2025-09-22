'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
        
        if (!response.ok) {
          console.debug('Categories API unavailable');
          return;
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data) && data.length > 0) {
          const parentCategories = data.filter((cat: any) => !cat.parentId && cat.isActive);
          const mappedCategories = parentCategories.slice(0, 6).map((cat: any) => ({
            id: cat.id.toString(),
            name: cat.name,
            slug: cat.slug,
            image: cat.image
          }));
          setCategories(Array.isArray(mappedCategories) ? mappedCategories : []);
        } else {
          console.log('FeaturedCategories API returned non-array data:', data);
          setCategories([]);
        }
      } catch (error) {
        console.debug('Categories API unavailable');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-600">Discover our wide range of household essentials</p>
        </div>
        
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="p-6">
                  <div className="w-full h-40 bg-gray-200 rounded-lg animate-pulse mb-4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Available</h3>
              <p className="text-gray-600">Categories will appear here once added.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="contents"
            >
              {categories.map((category, index) => (
              <motion.div
                key={category.slug}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link 
                  href={`/categories/${category.slug}`} 
                  className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1"
                >
                  <div className="relative">
                    <div className="w-full h-48 overflow-hidden relative bg-gradient-to-br from-gray-50 to-gray-100">
                      <Image 
                        src={category.image || fallbackImages[index % fallbackImages.length]} 
                        alt={category.name} 
                        fill
                        priority={index < 4}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                        onError={() => {
                          console.error(`Failed to load image: ${category.image}`);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-gray-900 text-center group-hover:text-green-600 transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
              ))}
            </motion.div>
          )}
        </div>
        
        <div className="text-center mt-10">
          <Link 
            href="/categories" 
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            View All Categories
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
