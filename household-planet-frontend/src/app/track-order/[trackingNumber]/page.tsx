'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import OrderTrackingProgress from '@/components/orders/OrderTrackingProgress';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUtils';
import { Package, MapPin, Clock, Phone, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface OrderData {
  id: number;
  orderNumber: string;
  status: string;
  trackingNumber: string;
  total: number;
  deliveryLocation: string;
  createdAt: string;
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    total: number;
    product: {
      name: string;
      images: string;
    };
    variant?: {
      name: string;
    };
  }>;
  statusHistory: Array<{
    status: string;
    notes?: string;
    createdAt: string;
  }>;
}

export default function TrackOrderPage() {
  const params = useParams();
  const trackingNumber = params.trackingNumber as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderByTracking = async () => {
      try {
        // Try tracking by order number first (works for both authenticated and guest orders)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/track/${trackingNumber}`);
        
        if (response.ok) {
          const data = await response.json();
          // Handle the API response structure
          const orderData = {
            id: data.order?.id || 0,
            orderNumber: data.order?.orderNumber || trackingNumber,
            status: data.order?.status || 'PENDING',
            trackingNumber: data.order?.trackingNumber || trackingNumber,
            total: data.order?.total || 0,
            deliveryLocation: data.order?.deliveryLocation || '',
            createdAt: data.order?.createdAt || new Date().toISOString(),
            items: data.order?.items || [],
            statusHistory: data.statusHistory?.map(h => ({
              status: h.status,
              notes: h.description || h.notes || '',
              createdAt: h.date || h.createdAt || new Date().toISOString()
            })) || []
          };
          setOrder(orderData);
        } else if (response.status === 404) {
          setError('Order not found. Please check your order number or tracking number.');
        } else {
          setError('Unable to fetch order information. Please try again later.');
        }
      } catch (err) {
        console.error('Tracking fetch error:', err);
        setError('Unable to connect to our servers. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    if (trackingNumber) {
      fetchOrderByTracking();
    }
  }, [trackingNumber]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Order Not Found</h3>
          <p className="text-gray-600 mb-6">
            We couldn't find an order with tracking number: <strong>{trackingNumber}</strong>
          </p>
          <div className="space-y-3">
            <Link href="/guest-order-lookup">
              <Button className="w-full">
                🔍 Look Up Order
              </Button>
            </Link>
            <Link href="/account/orders">
              <Button variant="outline" className="w-full">
                View My Orders
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/account/orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown'}
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
        {/* Order Tracking Progress */}
        <OrderTrackingProgress
          orderId={order.id}
          orderNumber={order.orderNumber}
          currentStatus={order.status}
          trackingNumber={order.trackingNumber}
        />





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