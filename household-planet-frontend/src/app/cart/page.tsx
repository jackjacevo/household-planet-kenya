'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { FiTrash2, FiHeart, FiPlus, FiMinus, FiTag, FiTruck } from 'react-icons/fi';

export default function CartPage() {
  const { state, updateQuantity, removeItem, saveForLater, applyPromoCode, removePromoCode, fetchCart, fetchSavedItems, updateGuestQuantity, removeGuestItem, getGuestCartTotal } = useCart();
  const { user } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [deliveryCost, setDeliveryCost] = useState(200);

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchSavedItems();
    }
  }, [user]);

  const cartItems = user ? state.items : state.guestCart;
  const cartTotal = user ? state.total : getGuestCartTotal();
  const finalTotal = user ? (state.finalTotal || state.total) : getGuestCartTotal();

  const handleQuantityChange = async (itemId: string, productId: string, variantId: string | undefined, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      if (user) {
        await updateQuantity(itemId, newQuantity);
      } else {
        updateGuestQuantity(productId, variantId, newQuantity);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId: string, productId: string, variantId: string | undefined) => {
    try {
      if (user) {
        await removeItem(itemId);
      } else {
        removeGuestItem(productId, variantId);
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !promoCode.trim()) return;

    try {
      await applyPromoCode(promoCode.trim());
      setPromoCode('');
    } catch (error) {
      console.error('Failed to apply promo code:', error);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15.5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some items to get started</p>
              <Link href="/products" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-7">
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 py-6 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Cart Items ({cartItems.length})</h2>
              </div>
              
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.id} className="px-4 py-6 sm:px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Image
                          src={item.product.images[0] || '/placeholder.jpg'}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="rounded-md object-cover"
                        />
                      </div>
                      
                      <div className="ml-6 flex-1">
                        <div className="flex">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm">
                              <Link href={`/products/${item.product.slug}`} className="font-medium text-gray-700 hover:text-gray-800">
                                {item.product.name}
                              </Link>
                            </h4>
                            {item.variant && (
                              <p className="mt-1 text-sm text-gray-500">{item.variant.name}</p>
                            )}
                            <p className="mt-1 text-sm font-medium text-gray-900">
                              KES {(item.variant?.price || item.product.price).toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="ml-4 flex-shrink-0 flow-root">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.productId, item.variantId, item.quantity - 1)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                  disabled={item.quantity <= 1}
                                >
                                  <FiMinus className="h-4 w-4" />
                                </button>
                                <span className="px-3 py-1 text-sm font-medium text-gray-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.productId, item.variantId, item.quantity + 1)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <FiPlus className="h-4 w-4" />
                                </button>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {user && (
                                  <button
                                    onClick={() => saveForLater(item.id)}
                                    className="text-gray-400 hover:text-gray-600"
                                    title="Save for later"
                                  >
                                    <FiHeart className="h-5 w-5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleRemoveItem(item.id, item.productId, item.variantId)}
                                  className="text-red-400 hover:text-red-600"
                                  title="Remove item"
                                >
                                  <FiTrash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-16 bg-white rounded-lg shadow-sm px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
            
            {user && (
              <div className="mt-6">
                {!state.promo ? (
                  <form onSubmit={handleApplyPromo} className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter promo code"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <FiTag className="h-4 w-4 mr-1" />
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                    <div className="flex items-center">
                      <FiTag className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">{state.promo.promoCode}</span>
                    </div>
                    <button
                      onClick={() => removePromoCode()}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
                
                {state.promoError && (
                  <p className="mt-2 text-sm text-red-600">{state.promoError}</p>
                )}
              </div>
            )}

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900">KES {cartTotal.toLocaleString()}</dd>
              </div>
              
              {user && state.promo && (
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-green-600">Discount ({state.promo.promoCode})</dt>
                  <dd className="text-sm font-medium text-green-600">-KES {state.promo.discount.toLocaleString()}</dd>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <dt className="flex items-center text-sm text-gray-600">
                  <FiTruck className="h-4 w-4 mr-1" />
                  Delivery
                </dt>
                <dd className="text-sm font-medium text-gray-900">KES {deliveryCost.toLocaleString()}</dd>
              </div>
              
              <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                <dt className="text-base font-medium text-gray-900">Total</dt>
                <dd className="text-base font-medium text-gray-900">
                  KES {(finalTotal + deliveryCost).toLocaleString()}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <Link
                href="/checkout"
                className="w-full bg-green-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center"
              >
                Proceed to Checkout
              </Link>
            </div>

            <div className="mt-6 text-center">
              <Link href="/products" className="text-sm font-medium text-green-600 hover:text-green-500">
                Continue Shopping
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}