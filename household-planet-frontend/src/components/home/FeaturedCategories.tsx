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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/api/categories`);
        
        if (!response.ok) {
          console.debug('Categories API unavailable');
          return;
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data) && data.length > 0) {
          const parentCategories = (Array.isArray(data) ? data : []).filter((cat: any) => !cat.parentId && cat.isActive);
          const mappedCategories = (Array.isArray(parentCategories) ? parentCategories : []).slice(0, 6).map((cat: any) => ({
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
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
        
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 auto-rows-max">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="category-card bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
                <div className="p-4">
                  <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded mt-3 animate-pulse" />
                </div>
              </div>
            ))
          ) : categories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Available</h3>
              <p className="text-gray-600">Categories will appear here once added.</p>
            </div>
          ) : (
            (Array.isArray(categories) ? categories : []).map((category, index) => (
              <Link 
                key={category.slug}
                href={`/products?category=${category.slug}`} 
                className="category-card bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition duration-300"
              >
                <div className="p-4">
                  <div className="w-full h-32 overflow-hidden rounded-lg relative">
                    <Image 
                      src={category.image || fallbackImages[index % fallbackImages.length]} 
                      alt={category.name} 
                      fill
                      priority={index === 0}
                      className="object-cover transition duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                      onError={() => {
                        console.error(`Failed to load image: ${category.image}`);
                      }}
                    />
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-gray-900 text-center">{category.name}</h3>
                </div>
              </Link>
            ))
          )}
        </div>
        
        <div className="text-center mt-6">
          <Link 
            href="/categories" 
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-full transition duration-300"
          >
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
}
