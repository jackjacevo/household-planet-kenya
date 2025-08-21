'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CheckCircleIcon, ClockIcon, TruckIcon } from '@heroicons/react/24/outline';

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

export default function OrderTracking({ trackingNumber }: { trackingNumber: string }) {
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const response = await api.get(`/delivery/track/${trackingNumber}`);
        setTracking(response.data.data);
      } catch (err) {
        setError('Tracking information not found');
      } finally {
        setLoading(false);
      }
    };

    if (trackingNumber) {
      fetchTracking();
    }
  }, [trackingNumber]);

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    }
    return <ClockIcon className="h-6 w-6 text-gray-400" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'text-green-600';
      case 'OUT_FOR_DELIVERY': return 'text-blue-600';
      case 'IN_TRANSIT': return 'text-yellow-600';
      case 'FAILED': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="text-center py-8">
        <TruckIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tracking Not Found</h3>
        <p className="text-gray-600">{error || 'Please check your tracking number'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Tracking</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Tracking Number:</span>
            <p className="font-medium">{tracking.trackingNumber}</p>
          </div>
          <div>
            <span className="text-gray-600">Order Number:</span>
            <p className="font-medium">{tracking.order.orderNumber}</p>
          </div>
          <div>
            <span className="text-gray-600">Delivery Location:</span>
            <p className="font-medium">{tracking.order.deliveryLocation}</p>
          </div>
          <div>
            <span className="text-gray-600">Current Status:</span>
            <p className={`font-medium ${getStatusColor(tracking.status)}`}>
              {tracking.status.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Progress</h3>
        <div className="space-y-4">
          {tracking.statusHistory.map((item, index) => (
            <div key={index} className="flex items-start space-x-3">
              {getStatusIcon(item.status, true)}
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {item.status.replace('_', ' ')}
                </p>
                {item.notes && (
                  <p className="text-sm text-gray-600">{item.notes}</p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {tracking.scheduledDate && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Scheduled Delivery</h4>
          <p className="text-blue-800">
            {new Date(tracking.scheduledDate).toLocaleDateString()} during {tracking.timeSlot}
          </p>
          {tracking.specialInstructions && (
            <p className="text-sm text-blue-700 mt-2">
              Special Instructions: {tracking.specialInstructions}
            </p>
          )}
        </div>
      )}
    </div>
  );
}