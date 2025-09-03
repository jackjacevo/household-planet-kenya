'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';
import { useToast } from '@/hooks/useToast';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images?: string[];
  averageRating?: number;
  totalReviews?: number;
}

export function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }) as any;
        if (data && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
          setProducts(data.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to fetch new arrivals:', error);
        showToast({
          type: 'error',
          title: 'Error',
          message: 'Failed to load new arrivals'
        });
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [showToast]);

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return getImageUrl(product.images[0]);
    }
    return getImageUrl(null);
  };

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">New Arrivals</h2>
          <Link href="/products" className="text-green-600 hover:text-green-700 font-medium">
            View All
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="product-card bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No New Arrivals Yet</h3>
            <p className="text-gray-600">New products will appear here once added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <div key={product.id} className="product-card bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition duration-300">
                <div className="relative">
                  <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded z-10">New</span>
                  <img 
                    src={getProductImage(product)} 
                    alt={product.name} 
                    className="w-full h-48 object-cover" 
                  />
                  <div className="product-actions absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-2 flex justify-center space-x-2 opacity-0 transform translate-y-2 transition duration-300">
                    <button className="p-2 text-gray-700 hover:text-green-600 rounded-full hover:bg-gray-100">
                      <Heart className="w-4 h-4" />
                    </button>
                    <Link 
                      href={`/products/${product.slug || product.id}`}
                      className="p-2 text-gray-700 hover:text-green-600 rounded-full hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button className="p-2 text-gray-700 hover:text-green-600 rounded-full hover:bg-gray-100">
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.averageRating || 5) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">({product.totalReviews || Math.floor(Math.random() * 30) + 5})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-bold">KSh {product.price.toLocaleString()}</span>
                    {product.comparePrice && (
                      <span className="text-xs text-gray-500 line-through">KSh {product.comparePrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}