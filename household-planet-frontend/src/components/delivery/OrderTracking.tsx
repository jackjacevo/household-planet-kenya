'use client';

import { useState, useEffect } from 'react';
import { socketService } from '@/lib/socket';
import { CheckCircle, Package, Truck, MapPin, Clock, AlertCircle, Copy, Share2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface TrackingData {
  trackingNumber: string;
  status: string;
  scheduledDate: string;
  timeSlot: string;
  specialInstructions?: string;
  order: {
    orderNumber: string;
    total: number;
    deliveryLocation: string;
  };
  statusHistory: Array<{
    status: string;
    notes?: string;
    timestamp: string;
  }>;
}

const statusSteps = [
  { key: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle },
  { key: 'PROCESSING', label: 'Processing', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle }
];

export default function OrderTracking({ trackingNumber }: { trackingNumber: string }) {
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/simple-delivery/track/${trackingNumber}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTracking(data.data);
          } else {
            setError(data.message || 'Order not found');
          }
        } else {
          setError(response.status === 404 ? 'Order not found' : 'Unable to fetch tracking information');
        }
      } catch (err) {
        setError('Unable to fetch tracking information');
      } finally {
        setLoading(false);
      }
    };

    if (trackingNumber && mounted) {
      fetchTracking();
    }
  }, [trackingNumber, mounted]);

  const getCurrentStepIndex = () => {
    if (!tracking) return 0;
    const currentStatus = tracking.status;
    const index = statusSteps.findIndex(step => step.key === currentStatus);
    return index >= 0 ? index : 0;
  };

  const getProgressPercentage = () => {
    const currentIndex = getCurrentStepIndex();
    return ((currentIndex + 1) / statusSteps.length) * 100;
  };

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(trackingNumber);
  };

  const shareTracking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Order Tracking',
        text: `Track order ${trackingNumber}`,
        url: window.location.href
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Truck className="absolute inset-0 m-auto h-6 w-6 text-blue-600 animate-pulse" />
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">Tracking your order...</p>
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    const isNotFound = error?.includes('not found') || error?.includes('Order not found');
    const isNetworkError = error?.includes('fetch') || error?.includes('network');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-orange-100">
          <div className="mb-6">
            {isNotFound ? (
              <Package className="mx-auto h-16 w-16 text-orange-500 mb-4" />
            ) : isNetworkError ? (
              <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            ) : (
              <Truck className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {isNotFound ? 'Order Not Found' : 
             isNetworkError ? 'Connection Error' : 
             'Tracking Unavailable'}
          </h3>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {isNotFound ? 
              'We couldn\'t find an order with this tracking number. Please check the number and try again.' :
             isNetworkError ?
              'Unable to connect to our tracking system. Please check your internet connection and try again.' :
              'Tracking information is temporarily unavailable. Please try again in a few minutes.'}
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Package className="h-4 w-4" />
              Try Again
            </button>
            
            <button 
              onClick={() => window.history.back()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go Back
            </button>
            
            {!isLoggedIn && (
              <button 
                onClick={() => window.location.href = '/login'}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                🔐 Login to View Orders
              </button>
            )}
            
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-3">Need help?</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a 
                  href="tel:+254790227760"
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  📞 Call Support
                </a>
                <a 
                  href="mailto:householdplanet819@gmail.com"
                  className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  ✉️ Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Tracking</h1>
              <p className="text-gray-600 mt-1">Real-time updates for your delivery</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyTrackingNumber}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copy</span>
              </button>
              <button
                onClick={shareTracking}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Order Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
              <p className="font-mono font-bold text-gray-900 text-sm">{tracking.trackingNumber}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500 mb-1">Order Total</p>
              <p className="font-bold text-green-600">{formatPrice(tracking.order.total)}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500 mb-1">Delivery Location</p>
              <p className="font-medium text-gray-900 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                {tracking.order.deliveryLocation}
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500 mb-1">Current Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                tracking.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                tracking.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                tracking.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {tracking.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Progress</h2>
          
          {/* Mobile Progress */}
          <div className="block sm:hidden mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          {/* Desktop Progress */}
          <div className="hidden sm:block">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              
              {/* Steps */}
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= getCurrentStepIndex();
                  const isCurrent = index === getCurrentStepIndex();
                  
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg' 
                          : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'animate-pulse scale-110' : ''}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className={`mt-3 text-sm font-medium text-center max-w-20 ${
                        isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Status History */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Status History</h2>
          <div className="space-y-4">
            {tracking.statusHistory.map((item, index) => {
              const isLatest = index === tracking.statusHistory.length - 1;
              return (
                <div key={index} className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${
                  isLatest ? 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-200' : 'bg-gray-50'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isLatest ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {item.status.replace('_', ' ')}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {item.notes && (
                      <p className="text-gray-600 mt-1">{item.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estimated Delivery */}
        {tracking.scheduledDate && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 mt-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="h-8 w-8" />
              <h2 className="text-xl font-bold">Estimated Delivery</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-blue-100 mb-1">Expected Date</p>
                <p className="text-2xl font-bold">
                  {new Date(tracking.scheduledDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-blue-100 mb-1">Time Slot</p>
                <p className="text-xl font-semibold">{tracking.timeSlot}</p>
              </div>
            </div>
            {tracking.specialInstructions && (
              <div className="mt-4 p-4 bg-white/10 rounded-lg">
                <p className="text-blue-100 mb-1">Special Instructions</p>
                <p>{tracking.specialInstructions}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}