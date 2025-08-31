'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  Share2, 
  Facebook, 

  MessageCircle,
  Download,
  Calendar,
  Clock
} from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import { Order } from '@/types';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    if (params.orderId) {
      loadOrder(params.orderId as string);
    }
  }, [params.orderId]);

  const loadOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        }
      );
      setOrder(response.data);
      setTrackingNumber(response.data.trackingNumber || generateTrackingNumber());
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTrackingNumber = () => {
    return `HP${Date.now().toString().slice(-8)}`;
  };

  const shareOrder = (platform: string) => {
    const url = window.location.href;
    const text = `I just placed an order at Household Planet Kenya! Order #${order?.orderNumber}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      default:
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    }
  };

  const downloadReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">We couldn't find the order you're looking for.</p>
          <Button onClick={() => router.push('/products')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + (order.deliveryLocation?.estimatedDays || 3));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">Thank you for your order. We'll send you updates via email and SMS.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Order Details</h2>
              <Button variant="outline" size="sm" onClick={downloadReceipt}>
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-semibold">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tracking Number</p>
                <p className="font-semibold">{trackingNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Status</p>
                <p className={`font-semibold ${
                  order.status === 'DELIVERED' ? 'text-green-600' :
                  order.status === 'SHIPPED' ? 'text-blue-600' :
                  order.status === 'PROCESSING' ? 'text-purple-600' :
                  order.status === 'CONFIRMED' ? 'text-blue-600' :
                  'text-yellow-600'
                }`}>
                  {order.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold">
                  {order.paymentMethod === 'MPESA' && 'M-Pesa'}
                  {order.paymentMethod === 'CARD' && 'Credit/Debit Card'}
                  {order.paymentMethod === 'CASH_ON_DELIVERY' && 'Cash on Delivery'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className={`font-semibold ${
                  order.paymentStatus === 'PAID' ? 'text-green-600' :
                  order.paymentStatus === 'PENDING' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {order.paymentStatus || 'PENDING'}
                </p>
              </div>
              {order.deliveryLocation && (
                <div>
                  <p className="text-sm text-gray-600">Delivery Location</p>
                  <p className="font-semibold">{order.deliveryLocation}</p>
                </div>
              )}
              {order.priority && order.priority !== 'NORMAL' && (
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <p className={`font-semibold ${
                    order.priority === 'HIGH' ? 'text-orange-600' :
                    order.priority === 'URGENT' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {order.priority}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-3">Items Ordered</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 relative">
                      <Image
                        src={item.product.images?.[0] || '/placeholder.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Unit Price: {formatPrice(item.price)}</p>
                      {item.variant && (
                        <p className="text-sm text-gray-500">
                          {item.variant.size && `Size: ${item.variant.size}`}
                          {item.variant.color && ` • Color: ${item.variant.color}`}
                          {item.variant.name && ` • ${item.variant.name}`}
                        </p>
                      )}
                      {item.product.sku && (
                        <p className="text-xs text-gray-400">SKU: {item.product.sku}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(item.total)}</p>
                      <p className="text-xs text-gray-500">{item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Delivery Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {order.deliveryLocation && (
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Delivery Location
                  </h3>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <p className="font-medium">{order.deliveryLocation}</p>
                    <p className="text-gray-600 mt-1">
                      Delivery Cost: {order.shippingCost === 0 ? (
                        <span className="text-green-600 font-medium">FREE</span>
                      ) : (
                        formatPrice(order.shippingCost)
                      )}
                    </p>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Estimated Delivery
                </h3>
                <p className="text-sm text-gray-600">
                  {estimatedDelivery.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {order.deliveryLocation?.estimatedDays || 3} business days
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-3">Order Status</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="ml-2 text-sm font-medium text-green-600">Order Confirmed</span>
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <span className="ml-2 text-sm text-gray-400">Processing</span>
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Truck className="h-5 w-5 text-gray-400" />
                  </div>
                  <span className="ml-2 text-sm text-gray-400">Shipped</span>
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <span className="ml-2 text-sm text-gray-400">Delivered</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Share2 className="h-5 w-5 mr-2" />
              Share Your Purchase
            </h2>
            <p className="text-gray-600 mb-4">Let your friends know about your great finds!</p>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareOrder('facebook')}
                className="flex items-center"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareOrder('twitter')}
                className="flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X (Twitter)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareOrder('whatsapp')}
                className="flex items-center"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareOrder('copy')}
              >
                Copy Link
              </Button>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal ({order.items?.length || 0} items)</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Cost</span>
                <span>
                  {order.shippingCost === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    formatPrice(order.shippingCost)
                  )}
                </span>
              </div>
              {order.deliveryPrice && order.deliveryPrice !== order.shippingCost && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Additional Delivery Cost</span>
                  <span>{formatPrice(order.deliveryPrice)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total Amount</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              
              {/* Payment Status */}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm">Payment Status:</span>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                  order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.paymentStatus || 'PENDING'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => router.push(`/track/${trackingNumber}`)}
                className="w-full"
              >
                Track Your Order
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/account/orders')}
                className="w-full"
              >
                View All Orders
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/products')}
                className="w-full"
              >
                Continue Shopping
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-3">Need Help?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  +254790 227 760
                </p>
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  householdplanet819@gmail.com
                </p>
                <p className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Mon-Fri: 8AM-6PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}