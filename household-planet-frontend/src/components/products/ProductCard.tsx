'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RatingDisplay } from '@/components/ui/RatingDisplay';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { openWhatsAppForProduct } from '@/lib/whatsapp';
import { getImageUrl } from '@/lib/imageUtils';
import { toastMessages } from '@/lib/toast-messages';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  compact?: boolean;
  priority?: boolean;
}

export function ProductCard({ product, viewMode = 'grid', compact = false, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleAddToCart = async () => {
    const wasAdded = await addToCart({
      id: `${product.id}-default`,
      productId: product.id,
      quantity: 1,
      product,
    });
    
    if (wasAdded) {
      showToast(toastMessages.cart.added(product.name));
    } else {
      showToast(toastMessages.cart.alreadyExists(product.name));
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const isAuthenticated = !!user;
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id, isAuthenticated);
        showToast(toastMessages.wishlist.removed(product.name));
      } else {
        const added = await addToWishlist(product, isAuthenticated);
        if (added) {
          showToast(toastMessages.wishlist.added(product.name));
        } else {
          showToast(toastMessages.wishlist.alreadyExists(product.name));
        }
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error);
    }
  };

  const handleWhatsAppOrder = () => {
    openWhatsAppForProduct(product);
  };

  const averageRating = product.averageRating || 0;
  const reviewCount = product.reviewCount || 0;

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
          <div className="w-full h-32 sm:h-36 bg-gray-50 overflow-hidden relative p-2">
            <Image
              src={getImageUrl(product.images && product.images.length > 0 ? product.images[0] : null)}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 200px"
              priority={priority}
              className="object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
        <div className="p-3">
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-medium text-gray-800 hover:text-orange-600 line-clamp-1 transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-orange-600 font-bold text-sm">Ksh {product.price.toLocaleString()}</span>
            <button
              onClick={handleWhatsAppOrder}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors w-8 h-8 flex items-center justify-center"
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
        <div className="w-full sm:w-48 h-48 sm:h-32 bg-gray-50 overflow-hidden flex-shrink-0 relative p-3">
          <Link href={`/products/${product.slug}`}>
            <Image
              src={getImageUrl(product.images && product.images.length > 0 ? product.images[0] : null)}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 200px"
              priority={priority}
              className="object-contain group-hover:scale-105 transition-transform duration-300"
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
            <RatingDisplay 
              rating={averageRating} 
              reviewCount={reviewCount} 
              size="md" 
              className="mt-2"
            />
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
                className="bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 text-gray-600 hover:text-red-600 transition-colors w-10 h-10 flex items-center justify-center"
              >
                <Heart
                  className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                />
              </button>
              <button
                onClick={handleWhatsAppOrder}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors flex items-center space-x-2"
                title="Order via WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm hidden sm:inline">WhatsApp</span>
              </button>
              <Button
                onClick={handleAddToCart}
                disabled={!product.stock || product.stock <= 0}
                className="flex items-center space-x-2"
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
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group transition-all duration-300 h-full flex flex-col"
    >
      <div className="relative">
        <Link href={`/products/${product.slug}`}>
          <div className="w-full h-56 bg-gray-50 overflow-hidden relative p-2">
            <Image
              src={getImageUrl(product.images && product.images.length > 0 ? product.images[0] : null)}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              priority={priority}
              className="object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
        
        {/* Stock indicator */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
          <span className="text-xs text-white font-medium">
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
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-green-100 text-gray-600 hover:text-green-600 transition-colors w-8 h-8 flex items-center justify-center"
        >
          <Heart
            className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`}
          />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-800 hover:text-green-600 transition-colors line-clamp-1 min-h-[1.25rem]">
            {product.name}
          </h3>
        </Link>
        {product.brand && (
          <p className="text-xs text-gray-500 mt-1">{product.brand.name}</p>
        )}

        <div className="hidden sm:block mt-2">
          <RatingDisplay 
            rating={averageRating} 
            reviewCount={reviewCount} 
            size="sm"
          />
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-green-600 font-bold text-sm">Ksh {product.price.toLocaleString()}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xs text-gray-500 line-through ml-1 block">
                  Ksh {product.comparePrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={handleWhatsAppOrder}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
              title="Order via WhatsApp"
            >
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={handleAddToCart}
              disabled={!product.stock || product.stock <= 0}
              className="bg-orange-600 hover:bg-orange-700 text-white p-1.5 sm:p-2 rounded-lg transition-colors disabled:bg-gray-300 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
              title="Add to Cart"
            >
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
