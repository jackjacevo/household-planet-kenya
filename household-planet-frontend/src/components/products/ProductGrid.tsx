'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  averageRating: number;
  totalReviews: number;
  category: { name: string };
  stock: number;
}

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  viewMode: 'grid' | 'list';
}

export default function ProductGrid({ products, loading, viewMode }: ProductGridProps) {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const addToCart = async (productId: string) => {
    try {
      // Add to cart logic here
      console.log('Adding to cart:', productId);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <FiShoppingCart size={64} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm p-6 flex gap-6">
            <div className="w-48 h-48 flex-shrink-0">
              <Image
                src={product.images[0] || '/placeholder-product.jpg'}
                alt={product.name}
                width={192}
                height={192}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2 rounded-full transition-colors ${
                    wishlist.has(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <FiHeart size={20} fill={wishlist.has(product.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{product.category.name}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar
                      key={i}
                      size={16}
                      className={i < Math.floor(product.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.totalReviews})</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    KSh {product.price.toLocaleString()}
                  </span>
                  {product.comparePrice && (
                    <span className="text-sm text-gray-500 line-through">
                      KSh {product.comparePrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock === 0}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FiShoppingCart size={16} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
          <div className="relative aspect-square">
            <Image
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-3 right-3 p-2 rounded-full bg-white shadow-md transition-colors ${
                wishlist.has(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <FiHeart size={18} fill={wishlist.has(product.id) ? 'currentColor' : 'none'} />
            </button>
            {product.comparePrice && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
              </div>
            )}
          </div>
          
          <div className="p-4">
            <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
            <Link href={`/products/${product.slug}`}>
              <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>
            
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar
                  key={i}
                  size={14}
                  className={i < Math.floor(product.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                />
              ))}
              <span className="text-xs text-gray-600 ml-1">({product.totalReviews})</span>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-lg font-bold text-gray-900">
                  KSh {product.price.toLocaleString()}
                </span>
                {product.comparePrice && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    KSh {product.comparePrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
              <button
                onClick={() => addToCart(product.id)}
                disabled={product.stock === 0}
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <FiShoppingCart size={14} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}