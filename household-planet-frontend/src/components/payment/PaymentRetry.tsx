'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface PaymentRetryProps {
  orderId: number;
  onRetrySuccess: () => void;
}

export default function PaymentRetry({ orderId, onRetrySuccess }: PaymentRetryProps) {
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    if (!confirm('Retry payment for this order?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/retry/${orderId}`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Payment retry initiated successfully');
        onRetrySuccess();
      }
    } catch (error) {
      console.error('Error retrying payment:', error);
      alert('Failed to retry payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
        <h3 className="text-sm font-medium text-yellow-800">Payment Failed</h3>
      </div>
      
      <p className="text-sm text-yellow-700 mb-4">
        Your payment could not be processed. You can retry the payment or try a different payment method.
      </p>

      <Button
        onClick={handleRetry}
        disabled={loading}
        size="sm"
        className="bg-yellow-600 hover:bg-yellow-700"
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Retrying...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Payment
          </>
        )}
      </Button>
    </div>
  );
}