'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaymentStatusProps {
  orderId: number;
  onComplete: () => void;
  onRetry: () => void;
}

export function PaymentStatus({ orderId, onComplete, onRetry }: PaymentStatusProps) {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/status/${orderId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        
        if (data.status === 'COMPLETED') {
          setStatus('success');
          setMessage('Payment successful! Your order has been confirmed.');
          setTimeout(onComplete, 2000);
        } else if (data.status === 'FAILED') {
          setStatus('failed');
          setMessage('Payment failed. Please try again.');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [orderId, onComplete]);

  return (
    <div className="text-center py-8">
      {status === 'pending' && (
        <>
          <Loader2 className="h-16 w-16 mx-auto mb-4 text-blue-600 animate-spin" />
          <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          <p className="text-sm text-gray-500">
            Please check your phone for the M-Pesa prompt and enter your PIN
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
          <h3 className="text-xl font-semibold mb-2 text-green-600">Payment Successful!</h3>
          <p className="text-gray-600">{message}</p>
        </>
      )}

      {status === 'failed' && (
        <>
          <XCircle className="h-16 w-16 mx-auto mb-4 text-red-600" />
          <h3 className="text-xl font-semibold mb-2 text-red-600">Payment Failed</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          <Button onClick={onRetry} className="mr-2">
            Try Again
          </Button>
          <Button variant="outline" onClick={onComplete}>
            Continue Shopping
          </Button>
        </>
      )}
    </div>
  );
}