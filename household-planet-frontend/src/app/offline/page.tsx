'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCw, ShoppingBag, Heart, Clock } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import Link from 'next/link';

export default function OfflinePage() {
  const { isOnline, getCachedProducts } = usePWA();
  const [cachedProducts, setCachedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const products = await getCachedProducts();
        setCachedProducts((products as any[]).slice(0, 6)); // Show first 6 cached products
      } catch (error) {
        console.error('Failed to load cached products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCachedData();
  }, [getCachedProducts]);

  useEffect(() => {
    if (isOnline) {
      // Redirect to home when back online
      window.location.href = '/';
    }
  }, [isOnline]);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-green-600" />
              <span className="text-xl font-bold text-gray-900">HP Kenya</span>
            </Link>
            <div className="flex items-center space-x-2 text-orange-600">
              <WifiOff className="h-5 w-5" />
              <span className="text-sm font-medium">Offline Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-orange-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center"
          >
            <WifiOff className="h-12 w-12 text-orange-600" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            You're Offline
          </h1>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            No internet connection detected. You can still browse cached products and manage your cart.
          </p>
          
          <button
            onClick={handleRetry}
            className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Try Again</span>
          </button>
        </div>

        {/* Offline Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mb-4 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Browse Products</h3>
            <p className="text-gray-600 text-sm">
              View previously loaded products and their details even without internet.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mb-4 flex items-center justify-center">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Manage Wishlist</h3>
            <p className="text-gray-600 text-sm">
              Add or remove items from your wishlist. Changes will sync when you're back online.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="bg-green-100 rounded-full p-3 w-12 h-12 mb-4 flex items-center justify-center">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Auto Sync</h3>
            <p className="text-gray-600 text-sm">
              Your cart and preferences will automatically sync when connection is restored.
            </p>
          </div>
        </div>

        {/* Cached Products */}
        {!isLoading && cachedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recently Viewed Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {cachedProducts.map((product, index) => (
                <motion.div
                  key={product.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                      {product.name || 'Product Name'}
                    </h3>
                    <p className="text-green-600 font-semibold text-sm">
                      KSh {product.price || '0'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/cart"
            className="inline-flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>View Cart</span>
          </Link>
          
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <Heart className="h-4 w-4" />
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
