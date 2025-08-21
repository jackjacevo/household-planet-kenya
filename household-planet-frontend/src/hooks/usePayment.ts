'use client';

import { useState } from 'react';
import axios from 'axios';

interface PaymentData {
  orderId: number;
  paymentMethod: string;
  phoneNumber?: string;
}

interface PaymentResponse {
  success: boolean;
  message: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
}

interface PaymentStatusResponse {
  status: string;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  amount?: number;
  phoneNumber?: string;
  resultDescription?: string;
}

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (data: PaymentData): Promise<PaymentResponse> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post<PaymentResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/initiate`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Payment failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (orderId: number): Promise<PaymentStatusResponse | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get<PaymentStatusResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/status/${orderId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (err) {
      console.error('Error checking payment status:', err);
      return null;
    }
  };

  const retryPayment = async (orderId: number): Promise<PaymentResponse> => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post<PaymentResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/retry/${orderId}`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Retry failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    initiatePayment,
    checkPaymentStatus,
    retryPayment,
    loading,
    error,
  };
}