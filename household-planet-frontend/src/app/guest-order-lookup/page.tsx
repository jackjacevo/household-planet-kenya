'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUtils';
import { Package, Phone, Mail, MapPin, Calendar, CreditCard, ArrowLeft, Search, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface OrderData {
  id: number;
  orderNumber: string;
  trackingNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  deliveryLocation: string;
  paymentMethod: string;
  createdAt: string;
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    total: number;
    product: {
      name: string;
      images: string;
      price: number;
    };
    variant?: {
      name: string;
    };
  }>;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  statusHistory: Array<{
    status: string;
    notes?: string;
    createdAt: string;
  }>;
}

export default function GuestOrderLookupPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<OrderData | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      setError('Please enter your order number');
      return;
    }
    
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/guest/${orderNumber.trim()}?phone=${encodeURIComponent(phone.trim())}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else if (response.status === 404) {
        setError('Order not found. Please check your order number and try again.');
      } else if (response.status === 400) {
        const errorData = await response.json();
        setError(errorData.message || 'Phone number does not match our records.');
      } else {
        setError('Unable to fetch order information. Please try again later.');
      }
    } catch (err) {
      console.error('Order lookup error:', err);
      setError('Unable to connect to our servers. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'text-green-600 bg-green-100';
      case 'SHIPPED': return 'text-blue-600 bg-blue-100';
      case 'PROCESSING': return 'text-yellow-600 bg-yellow-100';
      case 'CONFIRMED': return 'text-purple-600 bg-purple-100';
      case 'PENDING': return 'text-orange-600 bg-orange-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (order) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setOrder(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                New Search
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-gray-600 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(order.total)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Order Status</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Tracking Number</p>
                <p className="font-mono font-medium">{order.trackingNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Payment Method</p>
                <p className="font-medium">{order.paymentMethod.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Delivery Location</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {order.deliveryLocation}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Customer</p>
                <p className="font-medium">{order.customerInfo.name}</p>
              </div>
            </div>

            {/* Track Order Button */}
            <div className="mt-6 flex gap-3">
              <Link href={`/track-order/${order.trackingNumber}`}>
                <Button className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Track Order
                </Button>
              </Link>
              <a 
                href={`tel:${order.customerInfo.phone}`}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call Support
              </a>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h2 className="text-xl font-semibold mb-4">Order Items ({order.items.length})</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 relative flex-shrink-0">
                    <Image
                      src={getImageUrl(Array.isArray(item.product.images) ? item.product.images[0] : (typeof item.product.images === 'string' ? (() => { try { return JSON.parse(item.product.images)[0]; } catch { return null; } })() : null))}
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    {item.variant && (
                      <p className="text-sm text-gray-600">Variant: {item.variant.name}</p>
                    )}
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(item.total)}</p>
                    <p className="text-sm text-gray-600">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t">
              <div className="space-y-2 max-w-sm ml-auto">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Need Help?</h3>
            <p className="text-blue-800 mb-4">
              If you have any questions about your order, our customer support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="tel:+254790227760"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call Support
              </a>
              <a
                href="mailto:householdplanet819@gmail.com"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email Support
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Look Up Your Order</h1>
          <p className="text-gray-600">
            Enter your order details to view your order status and tracking information
          </p>
        </div>

        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Number *
            </label>
            <Input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g., WEB-2024-001"
              required
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Found in your order confirmation email or receipt
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254700000000"
              required
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              The phone number used when placing the order
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Looking up...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Look Up Order
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">Have an account?</p>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Sign In to View Orders
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
