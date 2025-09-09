'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Package, Truck, MapPin, Clock, AlertCircle } from 'lucide-react';
import { socketService } from '@/lib/socket';

interface OrderStatus {
  key: string;
  label: string;
  icon: any;
  description: string;
}

interface TrackingProgressProps {
  orderId: number;
  orderNumber: string;
  currentStatus: string;
  trackingNumber?: string;
  className?: string;
}

const ORDER_STATUSES: OrderStatus[] = [
  { key: 'PENDING', label: 'Order Placed', icon: Package, description: 'Your order has been received' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, description: 'Order confirmed and being prepared' },
  { key: 'PROCESSING', label: 'Processing', icon: Package, description: 'Items are being packed' },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck, description: 'Order is on the way' },
  { key: 'DELIVERED', label: 'Delivered', icon: MapPin, description: 'Order delivered successfully' }
];

export default function OrderTrackingProgress({ 
  orderId, 
  orderNumber, 
  currentStatus, 
  trackingNumber,
  className = '' 
}: TrackingProgressProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Connect to real-time updates
    const handleOrderUpdate = (data: any) => {
      if (data.orderId === orderId || data.orderNumber === orderNumber) {
        setIsAnimating(true);
        setTimeout(() => {
          setStatus(data.status);
          setIsAnimating(false);
        }, 300);
      }
    };

    const handleTrackingUpdate = (data: any) => {
      if (trackingNumber && data.trackingNumber === trackingNumber) {
        setIsAnimating(true);
        setTimeout(() => {
          setStatus(data.status);
          setIsAnimating(false);
        }, 300);
      }
    };

    socketService.on('orderStatusUpdate', handleOrderUpdate);
    socketService.on('trackingUpdate', handleTrackingUpdate);

    return () => {
      socketService.off('orderStatusUpdate', handleOrderUpdate);
      socketService.off('trackingUpdate', handleTrackingUpdate);
    };
  }, [orderId, orderNumber, trackingNumber]);

  const getCurrentStepIndex = () => {
    const index = ORDER_STATUSES.findIndex(step => step.key === status);
    return index >= 0 ? index : 0;
  };

  const getProgressPercentage = () => {
    const currentIndex = getCurrentStepIndex();
    return ((currentIndex + 1) / ORDER_STATUSES.length) * 100;
  };

  const getStatusColor = (stepStatus: string) => {
    const currentIndex = getCurrentStepIndex();
    const stepIndex = ORDER_STATUSES.findIndex(s => s.key === stepStatus);
    
    if (status === 'CANCELLED') return 'text-red-500 bg-red-100';
    if (stepIndex <= currentIndex) return 'text-green-600 bg-green-100';
    return 'text-gray-400 bg-gray-100';
  };

  const getProgressBarColor = () => {
    if (status === 'CANCELLED') return 'bg-red-500';
    if (status === 'DELIVERED') return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Order Progress</h3>
          <p className="text-sm text-gray-500">Track your order status in real-time</p>
        </div>
        {trackingNumber && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Tracking Number</p>
            <p className="font-mono text-sm font-medium">{trackingNumber}</p>
          </div>
        )}
      </div>

      {/* Mobile Progress Bar */}
      <div className="block sm:hidden mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">{Math.round(getProgressPercentage())}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden relative">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarColor()}`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
          {isAnimating && (
            <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_ease-in-out_infinite]" />
          )}
        </div>
        <div className="mt-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
            <Clock className="w-4 h-4 mr-2" />
            {ORDER_STATUSES.find(s => s.key === status)?.label || status}
          </div>
        </div>
      </div>

      {/* Desktop Progress Steps */}
      <div className="hidden sm:block">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarColor()}`}
              style={{ width: `${getProgressPercentage()}%` }}
            />
            {isAnimating && (
              <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_ease-in-out_infinite]" />
            )}
          </div>
          
          {/* Steps */}
          <div className="relative flex justify-between">
            {ORDER_STATUSES.map((step, index) => {
              const Icon = step.icon;
              const currentIndex = getCurrentStepIndex();
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              const isActive = status !== 'CANCELLED' && (isCompleted || isCurrent);
              
              return (
                <div key={step.key} className="flex flex-col items-center max-w-24">
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isActive 
                      ? `${getStatusColor(step.key)} shadow-lg transform ${isCurrent && isAnimating ? 'scale-110' : ''}` 
                      : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                    {status === 'CANCELLED' && isCurrent ? (
                      <AlertCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                    <p className={`text-xs mt-1 ${
                      isActive ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className={`w-2 h-2 rounded-full mt-2 ${
            status === 'DELIVERED' ? 'bg-green-500' :
            status === 'CANCELLED' ? 'bg-red-500' :
            'bg-blue-500 animate-pulse'
          }`} />
          <div>
            <p className="font-medium text-gray-900">
              {status === 'DELIVERED' ? 'Order Delivered Successfully!' :
               status === 'CANCELLED' ? 'Order Cancelled' :
               status === 'SHIPPED' ? 'Your order is on the way' :
               status === 'PROCESSING' ? 'Your order is being prepared' :
               status === 'CONFIRMED' ? 'Order confirmed and being processed' :
               'Order received and pending confirmation'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {status === 'DELIVERED' ? 'Thank you for shopping with us!' :
               status === 'CANCELLED' ? 'If you have questions, please contact support.' :
               status === 'SHIPPED' ? 'You will receive it soon.' :
               'Your order will be delivered within 1-3 business days.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}