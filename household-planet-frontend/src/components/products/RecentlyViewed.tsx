'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiX } from 'react-icons/fi';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  viewedAt: string;
}

interface RecentlyViewedProps {
  currentProductId: string;
}

export default function RecentlyViewed({ currentProductId }: RecentlyViewedProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentlyViewed();
  }, [currentProductId]);

  const fetchRecentlyViewed = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/user/recently-viewed`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter out current product
        const filteredProducts = data.filter((product: Product) => product.id !== currentProductId);
        setProducts(filteredProducts.slice(0, 6)); // Show max 6 items
      }
    } catch (error) {
      console.error('Error fetching recently viewed products:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromRecentlyViewed = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/user/recently-viewed/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setProducts(prev => prev.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Error removing from recently viewed:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const viewed = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - viewed.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return viewed.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-3 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <FiClock className="text-gray-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-lg transition-shadow relative">
            <button
              onClick={() => removeFromRecentlyViewed(product.id)}
              className="absolute top-2 right-2 z-10 p-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiX size={14} className="text-gray-600" />
            </button>
            
            <div className="relative aspect-square">
              <Link href={`/products/${product.slug}`}>
                <Image
                  src={product.images[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
            </div>
            
            <div className="p-3">
              <Link href={`/products/${product.slug}`}>
                <h3 className="text-sm font-medium text-gray-900 mb-1 hover:text-blue-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">
                  KSh {product.price.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(product.viewedAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}