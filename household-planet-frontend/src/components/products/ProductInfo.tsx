'use client';

import { useState } from 'react';
import { FiHeart, FiShoppingCart, FiStar, FiMinus, FiPlus, FiTruck, FiShield } from 'react-icons/fi';
import WhatsAppButton from '../WhatsAppButton';

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  attributes: any;
  size?: string;
  color?: string;
  material?: string;
}

interface Product {
  id: string;
  name: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  averageRating: number;
  totalReviews: number;
  stock: number;
  variants: ProductVariant[];
}

interface ProductInfoProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant) => void;
}

export default function ProductInfo({ product, selectedVariant, onVariantChange }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant?.stock || product.stock;
  const maxQuantity = Math.min(currentStock, 10);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const addToCart = async () => {
    setAddingToCart(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant?.id,
          quantity
        })
      });

      if (response.ok) {
        // Show success message
        console.log('Added to cart successfully');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`, {
        method: isWishlisted ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product.id })
      });

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  // Group variants by attribute type
  const variantGroups = product.variants.reduce((groups: any, variant) => {
    if (variant.size) {
      if (!groups.size) groups.size = [];
      groups.size.push(variant);
    }
    if (variant.color) {
      if (!groups.color) groups.color = [];
      groups.color.push(variant);
    }
    if (variant.material) {
      if (!groups.material) groups.material = [];
      groups.material.push(variant);
    }
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
        {product.shortDescription && (
          <p className="text-gray-600">{product.shortDescription}</p>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <FiStar
              key={i}
              size={20}
              className={i < Math.floor(product.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {product.averageRating.toFixed(1)} ({product.totalReviews} reviews)
        </span>
      </div>

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-gray-900">
          KSh {currentPrice.toLocaleString()}
        </span>
        {product.comparePrice && (
          <>
            <span className="text-xl text-gray-500 line-through">
              KSh {product.comparePrice.toLocaleString()}
            </span>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
              {Math.round(((product.comparePrice - currentPrice) / product.comparePrice) * 100)}% OFF
            </span>
          </>
        )}
      </div>

      {/* Variants */}
      {Object.keys(variantGroups).map((type) => (
        <div key={type}>
          <h3 className="text-sm font-medium text-gray-900 mb-2 capitalize">{type}</h3>
          <div className="flex flex-wrap gap-2">
            {variantGroups[type].map((variant: ProductVariant) => (
              <button
                key={variant.id}
                onClick={() => onVariantChange(variant)}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  selectedVariant?.id === variant.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {variant[type as keyof ProductVariant] as string}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${currentStock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className={`text-sm font-medium ${currentStock > 0 ? 'text-green-700' : 'text-red-700'}`}>
          {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
        </span>
      </div>

      {/* Quantity Selector */}
      {currentStock > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Quantity</label>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiMinus size={16} />
              </button>
              <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= maxQuantity}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlus size={16} />
              </button>
            </div>
            <span className="text-sm text-gray-600">
              {maxQuantity} available
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={addToCart}
            disabled={currentStock === 0 || addingToCart}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            <FiShoppingCart size={20} />
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
          <button
            onClick={toggleWishlist}
            className={`px-4 py-3 border rounded-lg transition-colors ${
              isWishlisted
                ? 'border-red-500 text-red-500 bg-red-50'
                : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
            }`}
          >
            <FiHeart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        {/* WhatsApp Inquiry Button */}
        <WhatsAppButton
          productName={product.name}
          productUrl={typeof window !== 'undefined' ? window.location.href : ''}
          className="w-full justify-center"
          size="md"
        />
      </div>

      {/* Delivery Info */}
      <div className="border-t pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <FiTruck className="text-green-600" size={20} />
          <div>
            <p className="font-medium text-gray-900">Free Delivery</p>
            <p className="text-sm text-gray-600">On orders over KSh 2,000</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FiShield className="text-blue-600" size={20} />
          <div>
            <p className="font-medium text-gray-900">Warranty</p>
            <p className="text-sm text-gray-600">1 year manufacturer warranty</p>
          </div>
        </div>
      </div>
    </div>
  );
}