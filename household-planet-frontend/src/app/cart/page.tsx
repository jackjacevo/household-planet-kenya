'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useDelivery } from '@/hooks/useDelivery';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Plus, Minus, Heart, ShoppingCart, Tag, MapPin, Truck, Clock, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUtils';


export default function CartPage() {
  const router = useRouter();
  const { items, savedForLater, updateQuantity, removeFromCart, saveForLater, moveToCart, getTotalPrice, cartData, isLoading } = useCart();
  const { calculateDeliveryCost, deliveryLocations, loading: locationsLoading, error: locationsError } = useDelivery();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number, discountAmount?: number} | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [manualDeliveryCost, setManualDeliveryCost] = useState('');
  const [promoError, setPromoError] = useState('');
  const [hasMounted, setHasMounted] = useState(false);

  // Handle client-side mounting
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // Debug delivery locations
  React.useEffect(() => {
    console.log('Cart page - Delivery locations:', {
      count: deliveryLocations.length,
      loading: locationsLoading,
      error: locationsError,
      locations: deliveryLocations.slice(0, 3) // Show first 3 for debugging
    });
  }, [deliveryLocations, locationsLoading, locationsError]);

  // Sync cart on component mount (only once)
  React.useEffect(() => {
    if (!hasMounted) return;
    
    const token = localStorage.getItem('token');
    if (token) {
      const { syncWithBackend } = useCart.getState();
      syncWithBackend().catch(console.error);
    }
  }, [hasMounted]);

  // Restore checkout data if returning from checkout
  React.useEffect(() => {
    if (!hasMounted) return;
    
    const checkoutData = localStorage.getItem('checkoutData');
    if (checkoutData) {
      try {
        const data = JSON.parse(checkoutData);
        if (data.promoInfo) {
          setAppliedPromo({
            code: data.promoInfo.code,
            discount: data.promoInfo.discountAmount / data.totals.subtotal,
            discountAmount: data.promoInfo.discountAmount
          });
        }
        if (data.deliveryInfo) {
          setSelectedLocation(data.deliveryInfo.selectedLocation || '');
          setDeliveryCost(data.deliveryInfo.deliveryCost || 0);
          setManualDeliveryCost(data.deliveryInfo.manualDeliveryCost || '');
        }
      } catch (error) {
        console.error('Error restoring checkout data:', error);
      }
    }
  }, [hasMounted]);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/promo-codes/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` })
        },
        body: JSON.stringify({
          code: promoCode,
          orderAmount: getTotalPrice(),
          productIds: items.map(item => item.product.id),
          categoryIds: items.map(item => item.product.categoryId)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAppliedPromo({ 
          code: data.promoCode.code, 
          discount: data.discountAmount / getTotalPrice(),
          discountAmount: data.discountAmount
        });
        setPromoError('');
        setPromoCode('');
      } else {
        const error = await response.json();
        setPromoError((error as Error).message || 'Invalid promo code');
      }
    } catch (error) {
      setPromoError('Failed to validate promo code');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoError('');
  };

  const handleLocationChange = async (locationId: string) => {
    setSelectedLocation(locationId);
    if (locationId) {
      const cost = await calculateDeliveryCost(locationId, getTotalPrice());
      setDeliveryCost(cost);
      // Auto-fill manual delivery cost with the location price
      const location = deliveryLocations.find(loc => loc.id === locationId);
      if (location) {
        setManualDeliveryCost(location.price.toString());
      }
    } else {
      setDeliveryCost(0);
      setManualDeliveryCost('');
    }
  };

  const handleManualDeliveryCostChange = (value: string) => {
    setManualDeliveryCost(value);
    const cost = parseFloat(value) || 0;
    setDeliveryCost(cost);
    // Only clear location if user manually types a different value
    if (selectedLocation) {
      const location = deliveryLocations.find(loc => loc.id === selectedLocation);
      if (location && location.price.toString() !== value) {
        setSelectedLocation('');
      }
    }
  };

  const getDiscountAmount = () => {
    return appliedPromo ? (appliedPromo.discountAmount || getTotalPrice() * appliedPromo.discount) : 0;
  };

  const getFinalTotal = () => {
    const currentDeliveryCost = (selectedLocation || manualDeliveryCost) ? 
      (deliveryCost > 0 ? deliveryCost : (manualDeliveryCost ? parseFloat(manualDeliveryCost) : 0)) : 0;
    return getTotalPrice() - getDiscountAmount() + currentDeliveryCost;
  };

  // Prevent hydration mismatch
  if (!hasMounted) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0 && savedForLater.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Link href="/products">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">Review your items and proceed to checkout</p>
      </div>
      

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items */}
          {items.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2 text-orange-600" />
                    Shopping Cart ({items.length} items)
                  </h2>
                  <div className="text-sm text-gray-600">
                    Subtotal: <span className="font-semibold text-orange-600">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
              </div>
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-6 border-b border-gray-100 last:border-b-0 space-y-4 sm:space-y-0 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 relative flex-shrink-0 rounded-lg overflow-hidden shadow-sm">
                      <Image
                        src={getImageUrl(Array.isArray(item.product.images) ? item.product.images[0] : (typeof item.product.images === 'string' ? JSON.parse(item.product.images)[0] : null))}
                        alt={item.product.name}
                        fill
                        sizes="(max-width: 640px) 80px, 112px"
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1">{item.product.name}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="text-orange-600 font-semibold">{formatPrice(item.product.price)}</p>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center text-yellow-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs text-gray-600 ml-1">4.5</span>
                        </div>

                      </div>
                      {item.variant && (
                        <p className="text-sm text-gray-500 mb-2">
                          {item.variant.size && `Size: ${item.variant.size}`}
                          {item.variant.color && ` • Color: ${item.variant.color}`}
                        </p>
                      )}
                      <p className="font-bold text-lg text-gray-900 sm:hidden">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end sm:space-x-6">
                    <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="h-8 w-8 p-0 hover:bg-white"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0 hover:bg-white"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="hidden sm:block">
                      <p className="font-bold text-lg text-gray-900">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => saveForLater(item.id)}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-9 w-9 p-0 rounded-full"
                        title="Save for later"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 w-9 p-0 rounded-full"
                        title="Remove from cart"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Saved for Later */}
          {savedForLater.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-pink-600" />
                  Saved for Later ({savedForLater.length} items)
                </h2>
              </div>
              {savedForLater.map((item) => (
                <div key={item.id} className="flex items-center p-4 sm:p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                    <Image
                      src={getImageUrl(Array.isArray(item.product.images) ? item.product.images[0] : (typeof item.product.images === 'string' ? JSON.parse(item.product.images)[0] : null))}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 ml-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.product.name}</h3>
                    <p className="text-orange-600 font-semibold">{formatPrice(item.product.price)}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveToCart(item.id)}
                      className="border-orange-200 text-orange-600 hover:bg-orange-50"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Move to Cart
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Promo Code */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
              <Tag className="h-5 w-5 mr-2 text-green-600" />
              Promo Code
            </h3>
            
            {appliedPromo ? (
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-semibold text-green-800">{appliedPromo.code}</p>
                  <p className="text-sm text-green-600">-{formatPrice(getDiscountAmount())} discount applied</p>
                </div>
                <Button variant="ghost" size="sm" onClick={removePromoCode} className="text-red-600 hover:bg-red-50">
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 border-gray-200 focus:border-orange-500"
                  />
                  <Button 
                    onClick={applyPromoCode} 
                    disabled={!promoCode.trim()}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Apply
                  </Button>
                </div>
                {promoError && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{promoError}</p>
                )}
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  💡 Try: <span className="font-mono">SAVE10</span>, <span className="font-mono">WELCOME20</span>, <span className="font-mono">HOUSEHOLD15</span>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
              <Truck className="h-5 w-5 mr-2 text-blue-600" />
              Delivery Location
            </h3>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                📍 Select your delivery location here. This will be used during checkout.
              </p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">📍 Select Delivery Location *</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  disabled={deliveryLocations.length === 0}
                >
                  <option value="">
                    {deliveryLocations.length === 0 ? 'Loading locations...' : 'Choose your delivery location'}
                  </option>
                  {deliveryLocations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} - {formatPrice(location.price)}
                      {location.estimatedDays && ` (${location.estimatedDays} days)`}
                    </option>
                  ))}
                </select>
                {deliveryLocations.length === 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                    ⚠️ Loading delivery locations... If this persists, please refresh the page or contact support.
                    {locationsError && (
                      <div className="mt-1 text-red-600">
                        Error: {locationsError}
                      </div>
                    )}
                  </div>
                )}
                {deliveryLocations.length > 0 && (
                  <div className="mt-1 text-xs text-green-600">
                    ✅ {deliveryLocations.length} locations loaded
                  </div>
                )}
                {selectedLocation && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    {(() => {
                      const location = deliveryLocations.find(loc => loc.id === selectedLocation);
                      return location ? (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-blue-700">
                            <Clock className="h-4 w-4 mr-1" />
                            Estimated: {location.estimatedDays} day{location.estimatedDays > 1 ? 's' : ''}
                          </div>
                          <div className="text-blue-800 font-semibold">
                            {formatPrice(location.price)}
                          </div>
                        </div>
                      ) : null;
                    })()} 
                  </div>
                )}
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">OR</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">💰 Custom Delivery Cost (KSh)</label>
                <Input
                  type="number"
                  placeholder="Enter custom delivery cost"
                  value={manualDeliveryCost}
                  onChange={(e) => handleManualDeliveryCostChange(e.target.value)}
                  min="0"
                  step="1"
                  className="border-gray-200 focus:border-orange-500 p-3"
                />
                <p className="text-xs text-gray-500 mt-1">* Use this if your location is not listed above</p>
              </div>
              
              {selectedLocation && (() => {
                const location = deliveryLocations.find(loc => loc.id === selectedLocation);
                return location ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium">📦 Estimated delivery: {location.estimatedDays} day{location.estimatedDays > 1 ? 's' : ''} to {location.name}</p>
                  </div>
                ) : null;
              })()}
            </div>
          </div>

          {/* Order Summary */}
          {items.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center">
                📋 Order Summary
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span className="font-semibold text-gray-900">{formatPrice(getTotalPrice())}</span>
                </div>
                
                {appliedPromo && (
                  <div className="flex justify-between items-center py-2 text-green-600">
                    <span className="flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      Discount ({appliedPromo.code})
                    </span>
                    <span className="font-semibold">-{formatPrice(getDiscountAmount())}</span>
                  </div>
                )}
                
                {(selectedLocation || manualDeliveryCost) && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 flex items-center">
                      <Truck className="h-4 w-4 mr-1" />
                      Delivery
                    </span>
                    <span className="font-semibold text-gray-900">
                      {deliveryCost > 0 ? formatPrice(deliveryCost) : (manualDeliveryCost ? formatPrice(parseFloat(manualDeliveryCost)) : formatPrice(0))}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-orange-600">{formatPrice(getFinalTotal())}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
                  disabled={(deliveryCost === 0 && !manualDeliveryCost) || isLoading}
                  onClick={() => {
                    // Ensure cart items are available before proceeding
                    if (items.length === 0) {
                      alert('Your cart is empty. Please add items before checkout.');
                      return;
                    }
                    
                    // Store checkout data including promo code info
                    const checkoutData = {
                      items: items,
                      deliveryInfo: {
                        selectedLocation,
                        deliveryCost,
                        manualDeliveryCost
                      },
                      promoInfo: appliedPromo ? {
                        code: appliedPromo.code,
                        discountAmount: getDiscountAmount()
                      } : null,
                      totals: {
                        subtotal: getTotalPrice(),
                        discount: getDiscountAmount(),
                        delivery: deliveryCost > 0 ? deliveryCost : (manualDeliveryCost ? parseFloat(manualDeliveryCost) : 0),
                        final: getFinalTotal()
                      }
                    };
                    
                    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
                    router.push('/checkout');
                  }}
                >
                  {isLoading ? '⏳ Loading...' : (deliveryCost === 0 && !manualDeliveryCost ? '⚠️ Select Delivery Location' : '🛒 Proceed to Checkout')}
                </Button>
                
                <Link href="/products">
                  <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50">
                    ← Continue Shopping
                  </Button>
                </Link>
              </div>
              
              {/* Delivery Location Reminder */}
              {!selectedLocation && !manualDeliveryCost && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700 text-center">
                    ⚠️ Please select a delivery location above to proceed
                  </p>
                </div>
              )}
              
              {/* Trust Indicators */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Secure Payment
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Fast Delivery
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    Easy Returns
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                    24/7 Support
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
