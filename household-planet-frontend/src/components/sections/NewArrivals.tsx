'use client';

import { motion } from 'framer-motion';
import { FiClock } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { useState, useEffect } from 'react';
import Button from '../ui/Button';

interface NewProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  daysAgo: number;
}

export default function NewArrivals() {
  const [newProducts, setNewProducts] = useState<NewProduct[]>([]);

  useEffect(() => {
    const mockNewProducts: NewProduct[] = [
      {
        id: 1,
        name: 'Smart Home Security Camera',
        price: 12500,
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        category: 'Electronics',
        daysAgo: 2
      },
      {
        id: 2,
        name: 'Bamboo Kitchen Utensil Set',
        price: 2800,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        category: 'Kitchen & Dining',
        daysAgo: 1
      },
      {
        id: 3,
        name: 'Minimalist Wall Clock',
        price: 3500,
        image: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        category: 'Home Decor',
        daysAgo: 3
      },
      {
        id: 4,
        name: 'Ergonomic Office Chair',
        price: 18000,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        category: 'Furniture',
        daysAgo: 1
      },
      {
        id: 5,
        name: 'Aromatherapy Diffuser',
        price: 4200,
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        category: 'Health & Beauty',
        daysAgo: 4
      },
      {
        id: 6,
        name: 'Collapsible Storage Bins',
        price: 1800,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        category: 'Storage & Organization',
        daysAgo: 2
      }
    ];
    setNewProducts(mockNewProducts);
  }, []);

  const formatPrice = (price: number) => {
    return `KSh ${price.toLocaleString()}`;
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HiSparkles className="h-8 w-8 text-blue-600 mr-2" />
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              New Arrivals
            </h2>
          </div>
          <p className="text-lg text-gray-600">
            Fresh additions to our collection - be the first to discover them
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {newProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                NEW
              </div>

              <div className="text-center mb-4">
                <div className="w-full h-40 mb-3 rounded-xl overflow-hidden group-hover:scale-105 transition-transform">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {product.category}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 text-center">
                {product.name}
              </h3>

              <div className="flex items-center justify-center mb-4 text-sm text-gray-600">
                <FiClock className="h-4 w-4 mr-1" />
                {product.daysAgo === 1 ? 'Added yesterday' : `Added ${product.daysAgo} days ago`}
              </div>

              <div className="text-center mb-4">
                <span className="text-xl font-bold text-blue-600">
                  {formatPrice(product.price)}
                </span>
              </div>

              <Button className="w-full group-hover:bg-blue-700 transition-colors">
                Quick View
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            See All New Arrivals
          </Button>
        </div>
      </div>
    </section>
  );
}