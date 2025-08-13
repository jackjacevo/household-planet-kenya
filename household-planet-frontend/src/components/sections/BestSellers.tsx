'use client';

import { motion } from 'framer-motion';
import { FiHeart, FiStar } from 'react-icons/fi';
import { AiFillHeart, AiFillStar } from 'react-icons/ai';
import { useState, useEffect } from 'react';
import Button from '../ui/Button';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
}

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Fetch real-time data from API
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        // Try to fetch from real API first
        const response = await fetch('http://localhost:3001/api/products?featured=true&limit=6');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || data);
        } else {
          throw new Error('API not available');
        }
      } catch (error) {
        // Fallback to enhanced mock data with real product images
        const mockProducts: Product[] = [
          {
            id: 1,
            name: 'Premium Non-Stick Cookware Set',
            price: 8500,
            originalPrice: 12000,
            rating: 4.8,
            reviews: 124,
            image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
            badge: 'Best Seller'
          },
          {
            id: 2,
            name: 'Elegant Dining Table Set',
            price: 25000,
            rating: 4.9,
            reviews: 89,
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
            badge: 'Premium'
          },
          {
            id: 3,
            name: 'Smart Storage Organizer',
            price: 3200,
            originalPrice: 4500,
            rating: 4.7,
            reviews: 156,
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
            badge: 'Sale'
          },
          {
            id: 4,
            name: 'Luxury Bedding Collection',
            price: 6800,
            rating: 4.6,
            reviews: 78,
            image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
          },
          {
            id: 5,
            name: 'Modern LED Ceiling Light',
            price: 4200,
            originalPrice: 5800,
            rating: 4.8,
            reviews: 92,
            image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
            badge: 'New'
          },
          {
            id: 6,
            name: 'Professional Cleaning Kit',
            price: 2800,
            rating: 4.5,
            reviews: 203,
            image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
          }
        ];
        setProducts(mockProducts);
      }
    };

    fetchBestSellers();
  }, []);

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const formatPrice = (price: number) => {
    return `KSh ${price.toLocaleString()}`;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full text-orange-800 text-sm font-medium mb-4"
          >
            🏆 Customer Favorites
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent sm:text-5xl">
            Best Sellers
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Most loved products by our customers across Kenya
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-white/20 hover:-translate-y-2"
            >
              <div className="relative p-6">
                {product.badge && (
                  <span className={`absolute top-4 left-4 px-2 py-1 text-xs font-semibold rounded-full ${
                    product.badge === 'Best Seller' ? 'bg-yellow-100 text-yellow-800' :
                    product.badge === 'Premium' ? 'bg-purple-100 text-purple-800' :
                    product.badge === 'Sale' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {product.badge}
                  </span>
                )}
                
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {favorites.has(product.id) ? (
                    <AiFillHeart className="h-5 w-5 text-red-500" />
                  ) : (
                    <FiHeart className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                <div className="text-center mb-6">
                  <div className="w-full h-48 mb-4 rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => 
                      i < Math.floor(product.rating) ? (
                        <AiFillStar key={i} className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <FiStar key={i} className="h-4 w-4 text-gray-300" />
                      )
                    )}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {product.originalPrice && (
                    <span className="text-sm font-semibold text-green-600">
                      Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  )}
                </div>

                <Button className="w-full">
                  Add to Cart
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
}