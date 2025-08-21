'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { openWhatsAppForProduct } from '@/lib/whatsapp';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  compact?: boolean;
}

export function ProductCard({ product, viewMode = 'grid', compact = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      productId: product.id,
      quantity: 1,
      product,
    });
  };

  const handleAddToWishlist = () => {
    addToWishlist(product);
  };

  const handleWhatsAppOrder = () => {
    openWhatsAppForProduct(product);
  };

  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  if (compact) {
    return (
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group transition-all duration-300"
      >
        <Link href={`/products/${product.slug}`}>
          <div className="w-full h-32 sm:h-36 bg-gray-100 flex items-center justify-center overflow-hidden relative">
            <Image
              src={product.images?.[0] || '/images/products/placeholder.svg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
        <div className="p-3">
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-medium text-gray-800 hover:text-orange-600 line-clamp-2 transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-orange-600 font-bold text-sm">Ksh {product.price.toLocaleString()}</span>
            <button
              onClick={handleWhatsAppOrder}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors min-h-44 min-w-44"
              title="Order via WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ x: 5, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group transition-all duration-300 flex flex-col sm:flex-row"
      >
        <div className="w-full sm:w-48 h-48 sm:h-32 bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
          <Link href={`/products/${product.slug}`}>
            <Image
              src={product.images?.[0] || '/images/products/placeholder.svg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 200px"
            />
          </Link>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <Link href={`/products/${product.slug}`}>
              <h3 className="text-base sm:text-lg font-medium text-gray-800 hover:text-orange-600 transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2 hidden sm:block">{product.shortDescription}</p>
            <div className="flex items-center mt-2">
              <div className="flex text-yellow-400 text-sm">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(averageRating) ? 'fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2">
                ({product.reviews?.length || 0})
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div>
              <span className="text-orange-600 font-bold text-lg sm:text-xl">Ksh {product.price.toLocaleString()}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  Ksh {product.comparePrice.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddToWishlist}
                className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 text-gray-600 hover:text-red-600 transition-colors min-h-44 min-w-44"
              >
                <Heart
                  className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                />
              </button>
              <button
                onClick={handleWhatsAppOrder}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors flex items-center space-x-2 min-h-44"
                title="Order via WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm hidden sm:inline">WhatsApp</span>
              </button>
              <Button
                onClick={handleAddToCart}
                disabled={!product.stock || product.stock <= 0}
                className="flex items-center space-x-2 min-h-44"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Add to Cart</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group transition-all duration-300"
    >
      <div className="relative">
        <Link href={`/products/${product.slug}`}>
          <div className="w-full h-48 sm:h-56 bg-gray-100 flex items-center justify-center overflow-hidden relative">
            <Image
              src={product.images?.[0] || '/images/products/placeholder.svg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
        
        {/* Stock indicator */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <span className="text-xs text-white">
            {product.stock && product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded-full">
            -{discount}%
          </span>
        )}
        
        <button
          onClick={handleAddToWishlist}
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-green-100 text-gray-600 hover:text-green-600 transition-colors min-h-44 min-w-44"
        >
          <Heart
            className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`}
          />
        </button>
      </div>

      <div className="p-3 sm:p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm sm:text-base font-medium text-gray-800 hover:text-green-600 line-clamp-2 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center mt-2">
          <div className="flex text-yellow-400 text-sm">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.floor(averageRating) ? 'fill-current' : 'text-gray-300'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({product.reviews?.length || 0})
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-green-600 font-bold">Ksh {product.price.toLocaleString()}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xs text-gray-500 line-through ml-1">
                  Ksh {product.comparePrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleWhatsAppOrder}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 min-h-44"
              title="Order via WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">WhatsApp</span>
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!product.stock || product.stock <= 0}
              className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-lg transition-colors disabled:bg-gray-300 min-h-44 min-w-44"
              title="Add to Cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>


      </div>
    </motion.div>
  );
}
