'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { api } from '../../../../../lib/api';
import Link from 'next/link';
import { FiCheck, FiTruck, FiShare2, FiDownload, FiMapPin, FiUser } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaWhatsapp } from 'react-icons/fa';

interface GuestOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
  deliveryLocation: string;
  paymentMethod: string;
  guestEmail: string;
  guestName: string;
  guestPhone: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      images: string[];
    };
    variant?: {
      name: string;
    };
  }>;
}

export default function GuestOrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<GuestOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const email = searchParams.get('email');

  useEffect(() => {
    if (email) {
      fetchOrder();
    } else {
      router.push('/');
    }
  }, [params.orderNumber, email]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/guest/${params.orderNumber}?email=${email}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const shareOrder = (platform: string) => {
    const url = window.location.href;
    const text = `I just placed an order on Household Planet Kenya! Order #${order?.orderNumber}`;
    
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
    }
  };

  const handleCreateAccount = () => {
    // Redirect to registration with pre-filled email
    router.push(`/auth/register?email=${encodeURIComponent(email || '')}&orderNumber=${order?.orderNumber}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
          <p className="text-gray-600 mb-4">Please check your order number and email address.</p>
          <Link href="/" className="text-green-600 hover:text-green-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <FiCheck className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-lg text-gray-600 mb-4">
            Thank you for your order, {order.guestName}. We've received your order and will begin processing it soon.
          </p>
          <div className="bg-white rounded-lg shadow-sm p-6 inline-block">
            <div className="text-sm text-gray-500 mb-1">Order Number</div>
            <div className="text-2xl font-bold text-gray-900">{order.orderNumber}</div>
          </div>
        </div>

        {/* Create Account Prompt */}
        {!showCreateAccount && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <FiUser className="h-6 w-6 text-blue-600 mt-1 mr-3" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Create an Account for Easy Tracking</h3>
                <p className="text-blue-700 mb-4">
                  Create an account to easily track this order and enjoy faster checkout for future purchases.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateAccount}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Create Account
                  </button>
                  <button
                    onClick={() => setShowCreateAccount(true)}
                    className="text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:text-blue-700"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                      {item.product.images[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.product.name}</h3>
                      {item.variant && (
                        <p className="text-sm text-gray-500">{item.variant.name}</p>
                      )}
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">Name</div>
                  <div className="text-sm text-gray-600">{order.guestName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Email</div>
                  <div className="text-sm text-gray-600">{order.guestEmail}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Phone</div>
                  <div className="text-sm text-gray-600">{order.guestPhone}</div>
                </div>
              </div>
            </div>

            {/* Shipping & Delivery */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping & Delivery</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <FiMapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Shipping Address</div>
                    <div className="text-sm text-gray-600">{order.shippingAddress}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiTruck className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Delivery Location</div>
                    <div className="text-sm text-gray-600">{order.deliveryLocation}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Tracking Info */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Track Your Order</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiTruck className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Order Tracking</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        To track your order, save this page or bookmark the link. You can also track your order using:
                      </p>
                      <ul className="mt-2 list-disc list-inside">
                        <li>Order Number: <strong>{order.orderNumber}</strong></li>
                        <li>Email: <strong>{order.guestEmail}</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Sharing */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Share Your Purchase</h2>
              <p className="text-sm text-gray-600 mb-4">
                Share your order with friends and family on social media!
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => shareOrder('facebook')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaFacebook className="h-4 w-4 text-blue-600 mr-2" />
                  Facebook
                </button>
                <button
                  onClick={() => shareOrder('twitter')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaTwitter className="h-4 w-4 text-blue-400 mr-2" />
                  Twitter
                </button>
                <button
                  onClick={() => shareOrder('whatsapp')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FaWhatsapp className="h-4 w-4 text-green-500 mr-2" />
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <dl className="space-y-3">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Order Total</dt>
                  <dd className="font-medium text-gray-900">KES {order.total.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Payment Method</dt>
                  <dd className="font-medium text-gray-900">{order.paymentMethod}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Order Date</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => window.print()}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiDownload className="h-4 w-4 mr-2" />
                  Print Receipt
                </button>
                <Link
                  href="/products"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Customer Support */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>If you have any questions about your order, please contact our customer support:</p>
                <div>
                  <strong>Phone:</strong> +254 700 000 000
                </div>
                <div>
                  <strong>Email:</strong> support@householdplanet.co.ke
                </div>
                <div>
                  <strong>Hours:</strong> Mon-Fri 8AM-6PM
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Reference your order number <strong>{order.orderNumber}</strong> when contacting support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}