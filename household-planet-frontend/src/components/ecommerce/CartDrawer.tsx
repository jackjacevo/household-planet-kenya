'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/contexts/ToastContext';
import { getImageUrl } from '@/lib/imageUtils';
import Image from 'next/image';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, isLoading } = useCart();
  const { showToast } = useToast();

  const handleRemoveFromCart = (item: any) => {
    removeFromCart(item.id);
    showToast({
      variant: 'destructive',
      title: 'Removed from Cart 🗑️',
      description: `${item.product.name} • Item removed`,
    });
  };

  const subtotal = getTotalPrice();
  const shipping = subtotal > 5000 ? 0 : 100;
  const total = subtotal + shipping;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold">Shopping Cart</h2>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  {getTotalItems()}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading cart...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Add some products to get started</p>
                  <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        <Image
                          src={getImageUrl(item.product.images && item.product.images.length > 0 ? item.product.images[0] : null)}
                          alt={item.product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/products/placeholder.svg';
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
                        {item.variant && (
                          <p className="text-sm text-gray-500">
                            {item.variant.size && `Size: ${item.variant.size}`}
                            {item.variant.color && ` • Color: ${item.variant.color}`}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-semibold text-green-600">
                            Ksh {(item.variant?.price || item.product.price).toLocaleString()}
                          </span>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                              disabled={isLoading}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                              disabled={isLoading}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveFromCart(item)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 text-red-500 transition-colors"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && !isLoading && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>Ksh {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-gray-500">Calculated at checkout</span>
                  </div>

                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                    <span>Subtotal</span>
                    <span>Ksh {subtotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link href="/cart" onClick={onClose}>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white btn-hover">
                      Proceed to Cart Page
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                    onClick={onClose}
                  >
                    Continue Shopping
                  </Button>
                </div>

                {/* Security Badge */}
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <span className="w-3 h-3 bg-green-500 rounded-full" />
                    Secure checkout guaranteed
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}