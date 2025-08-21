'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useDelivery } from '@/hooks/useDelivery';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash2, Plus, Minus, Heart, ShoppingCart, Tag, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, savedForLater, updateQuantity, removeFromCart, saveForLater, moveToCart, getTotalPrice } = useCart();
  const { calculateDeliveryCost, deliveryLocations } = useDelivery();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [promoError, setPromoError] = useState('');

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    // Mock promo codes - replace with API call
    const promoCodes = {
      'SAVE10': { discount: 0.1, minAmount: 1000 },
      'WELCOME20': { discount: 0.2, minAmount: 2000 },
      'HOUSEHOLD15': { discount: 0.15, minAmount: 1500 }
    };
    
    const promo = promoCodes[promoCode.toUpperCase() as keyof typeof promoCodes];
    const subtotal = getTotalPrice();
    
    if (!promo) {
      setPromoError('Invalid promo code');
      return;
    }
    
    if (subtotal < promo.minAmount) {
      setPromoError(`Minimum order of ${formatPrice(promo.minAmount)} required`);
      return;
    }
    
    setAppliedPromo({ code: promoCode.toUpperCase(), discount: promo.discount });
    setPromoError('');
    setPromoCode('');
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
    } else {
      setDeliveryCost(0);
    }
  };

  const getDiscountAmount = () => {
    return appliedPromo ? getTotalPrice() * appliedPromo.discount : 0;
  };

  const getFinalTotal = () => {
    return getTotalPrice() - getDiscountAmount() + deliveryCost;
  };

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items */}
          {items.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Shopping Cart ({items.length} items)</h2>
              </div>
              {items.map((item) => (
                <div key={item.id} className="flex items-center p-4 border-b last:border-b-0">
                  <div className="w-24 h-24 relative">
                    <Image
                      src={item.product.images[0] || '/placeholder.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  
                  <div className="flex-1 ml-4">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-gray-600">{formatPrice(item.product.price)}</p>
                    {item.variant && (
                      <p className="text-sm text-gray-500">
                        {item.variant.size && `Size: ${item.variant.size}`}
                        {item.variant.color && ` • Color: ${item.variant.color}`}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <span className="w-8 text-center">{item.quantity}</span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="ml-4">
                    <p className="font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                  
                  <div className="ml-4 flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => saveForLater(item.id)}
                      className="text-orange-600"
                      title="Save for later"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600"
                      title="Remove from cart"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Saved for Later */}
          {savedForLater.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Saved for Later ({savedForLater.length} items)</h2>
              </div>
              {savedForLater.map((item) => (
                <div key={item.id} className="flex items-center p-4 border-b last:border-b-0">
                  <div className="w-20 h-20 relative">
                    <Image
                      src={item.product.images[0] || '/placeholder.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  
                  <div className="flex-1 ml-4">
                    <h3 className="font-semibold">{item.product.name}</h3>
                    <p className="text-gray-600">{formatPrice(item.product.price)}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveToCart(item.id)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Move to Cart
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600"
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Promo Code
            </h3>
            
            {appliedPromo ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                <div>
                  <p className="font-medium text-green-800">{appliedPromo.code}</p>
                  <p className="text-sm text-green-600">-{formatPrice(getDiscountAmount())} discount applied</p>
                </div>
                <Button variant="ghost" size="sm" onClick={removePromoCode} className="text-red-600">
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={applyPromoCode} disabled={!promoCode.trim()}>
                    Apply
                  </Button>
                </div>
                {promoError && (
                  <p className="text-sm text-red-600">{promoError}</p>
                )}
                <div className="text-xs text-gray-500">
                  Try: SAVE10, WELCOME20, HOUSEHOLD15
                </div>
              </div>
            )}
          </div>

          {/* Delivery Location */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Delivery Location
            </h3>
            
            <select
              value={selectedLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select delivery location</option>
              {deliveryLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} - {formatPrice(location.price)}
                </option>
              ))}
            </select>
          </div>

          {/* Order Summary */}
          {items.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                
                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span>-{formatPrice(getDiscountAmount())}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{deliveryCost > 0 ? formatPrice(deliveryCost) : 'Select location'}</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(getFinalTotal())}</span>
                </div>
              </div>
              
              <Link href="/checkout">
                <Button size="lg" className="w-full mb-3">
                  Proceed to Checkout
                </Button>
              </Link>
              
              <Link href="/products">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
