'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Heart, ShoppingCart, MessageCircle, Loader2 } from 'lucide-react';
import { Product } from '@/types';
import { api } from '@/lib/api';
import { openWhatsAppForProduct } from '@/lib/whatsapp';

interface RecentlyViewedProps {
  limit?: number;
}



export function RecentlyViewed({ limit = 4 }: RecentlyViewedProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/products/user/recently-viewed?limit=${limit}`) as any;
        const data = response?.data || [];
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching recently viewed:', error);
        // Always set empty array on error - no fallback demo data
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, [limit]);

  const handleWhatsAppOrder = (product: any) => {
    openWhatsAppForProduct(product);
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading recently viewed...</span>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-green-600 mr-3" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Recently Viewed</h2>
          </div>
          <Link href="/products" className="text-green-600 hover:text-green-800 font-medium">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 product-card transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="relative">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2">
                  <button className="bg-white rounded-full p-2 shadow hover:bg-green-100 text-gray-600 hover:text-green-600">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <span className="text-xs text-white">Recently Viewed</span>
                </div>
              </div>
              <div className="p-4">
                <Link href={`/products/${product.id}`} className="text-sm font-medium text-gray-800 hover:text-green-600 line-clamp-2">
                  {product.name}
                </Link>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-green-600 font-bold">Ksh {product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleWhatsAppOrder(product)}
                      className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition"
                      title="Order via WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition">
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}