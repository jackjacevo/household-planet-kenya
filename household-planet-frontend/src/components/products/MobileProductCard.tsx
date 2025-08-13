'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar, FiEye } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

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

interface MobileProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export default function MobileProductCard({ product, viewMode = 'grid' }: MobileProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addToCart({
        productId: product.id,
        quantity: 1,
        variantId: null
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const discountPercentage = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mobile-card mb-4"
      >
        <Link href={`/products/${product.slug}`} className="flex p-4 gap-4">
          {/* Image */}
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
              sizes="96px"
            />
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            
            {discountPercentage > 0 && (
              <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                -{discountPercentage}%
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">
                {product.name}
              </h3>
              <button
                onClick={handleWishlist}
                className="min-h-[44px] min-w-[44px] p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <FiHeart 
                  className={`w-4 h-4 ${isWishlisted ? 'fill-current text-red-500' : ''}`} 
                />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.totalReviews})
              </span>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-blue-600 text-lg">
                  KSh {product.price.toLocaleString()}
                </span>
                {product.comparePrice && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    KSh {product.comparePrice.toLocaleString()}
                  </span>
                )}
              </div>
              
              <button
                onClick={handleAddToCart}
                className="min-h-[44px] px-4 bg-blue-600 text-white rounded-lg text-sm font-medium active:scale-95 transition-transform"
                disabled={product.stock === 0}
              >
                <FiShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mobile-card group"
    >
      <Link href={`/products/${product.slug}`}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoading(false)}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          />
          
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercentage > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                -{discountPercentage}%
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
                Out of Stock
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleWishlist}
              className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors"
            >
              <FiHeart 
                className={`w-4 h-4 ${isWishlisted ? 'fill-current text-red-500' : ''}`} 
              />
            </button>
            <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-blue-500 transition-colors">
              <FiEye className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Add to Cart */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium active:scale-95 transition-transform disabled:bg-gray-400"
              disabled={product.stock === 0}
            >
              <FiShoppingCart className="w-4 h-4 inline mr-2" />
              Add to Cart
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-1">{product.category.name}</p>
          
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 text-sm">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.totalReviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-blue-600">
                KSh {product.price.toLocaleString()}
              </span>
              {product.comparePrice && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  KSh {product.comparePrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}