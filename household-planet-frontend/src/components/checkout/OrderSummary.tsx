'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUtils';
import { 
  ShoppingBag, 
  Truck, 
  Tag, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Package,
  Clock,
  Shield
} from 'lucide-react';
import Image from 'next/image';
import { CartItem } from '@/types';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryCost: number;
  discount?: number;
  promoCode?: string;
  total: number;
  estimatedDelivery?: string;
  onCheckout?: () => void;
  showCheckoutButton?: boolean;
  loading?: boolean;
}

export function OrderSummary({
  items,
  subtotal,
  deliveryCost,
  discount = 0,
  promoCode,
  total,
  estimatedDelivery,
  onCheckout,
  showCheckoutButton = true,
  loading = false
}: OrderSummaryProps) {
  const [showItems, setShowItems] = useState(false);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);

  const savings = discount;
  const finalTotal = subtotal - discount + deliveryCost;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Order Summary</h2>
        <span className="text-sm text-gray-500">({items.length} items)</span>
      </div>

      {/* Items Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowItems(!showItems)}
          className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center">
            <ShoppingBag className="h-4 w-4 mr-2 text-gray-600" />
            <span className="text-sm font-medium">View Items</span>
          </div>
          {showItems ? (
            <ChevronUp className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          )}
        </button>

        {showItems && (
          <div className="mt-3 space-y-3 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-2 border border-gray-100 rounded">
                <div className="w-12 h-12 relative flex-shrink-0">
                  <Image
                    src={getImageUrl(Array.isArray(item.product.images) ? item.product.images[0] : (typeof item.product.images === 'string' ? (() => { try { return JSON.parse(item.product.images)[0]; } catch { return null; } })() : null))}
                    alt={item.product.name}
                    fill
                    sizes="48px"
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  {item.variant && (
                    <p className="text-xs text-gray-500">
                      {item.variant.size && `Size: ${item.variant.size}`}
                      {item.variant.color && ` • ${item.variant.color}`}
                    </p>
                  )}
                </div>
                <p className="text-sm font-semibold">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <div className="flex items-center">
              <Tag className="h-3 w-3 mr-1" />
              <span>Discount {promoCode && `(${promoCode})`}</span>
            </div>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <div className="flex items-center">
            <Truck className="h-3 w-3 mr-1 text-gray-500" />
            <span>Delivery</span>
            <button
              onClick={() => setShowDeliveryInfo(!showDeliveryInfo)}
              className="ml-1 text-blue-600 hover:text-blue-700"
            >
              <Info className="h-3 w-3" />
            </button>
          </div>
          <span>
            {deliveryCost === 0 ? (
              <span className="text-green-600 font-medium">FREE</span>
            ) : (
              formatPrice(deliveryCost)
            )}
          </span>
        </div>

        {showDeliveryInfo && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs">
            <div className="space-y-1">
              <p className="flex items-center">
                <Package className="h-3 w-3 mr-1" />
                Free delivery on orders over Ksh 5,000
              </p>
              <p className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {estimatedDelivery || '2-5 business days delivery'}
              </p>
              <p className="flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                Secure packaging guaranteed
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Total</span>
          <div className="text-right">
            <p className="text-lg font-bold text-orange-600">
              {formatPrice(finalTotal)}
            </p>
            {savings > 0 && (
              <p className="text-xs text-green-600">
                You save {formatPrice(savings)}!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && onCheckout && (
        <Button
          onClick={onCheckout}
          disabled={loading || items.length === 0}
          className="w-full mb-4"
          size="lg"
        >
          {loading ? 'Processing...' : `Checkout • ${formatPrice(finalTotal)}`}
        </Button>
      )}

      {/* Security & Guarantees */}
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center">
          <Shield className="h-3 w-3 mr-2 text-green-600" />
          <span>Secure checkout with SSL encryption</span>
        </div>
        <div className="flex items-center">
          <Package className="h-3 w-3 mr-2 text-blue-600" />
          <span>Free returns within 7 days</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-2 text-orange-600" />
          <span>24/7 customer support</span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
        <p className="mb-1">Need help with your order?</p>
        <div className="space-y-1">
          <p>📞 +254790 227 760</p>
          <p>✉️ householdplanet819@gmail.com</p>
          <p>💬 WhatsApp support available</p>
        </div>
      </div>
    </div>
  );
}
