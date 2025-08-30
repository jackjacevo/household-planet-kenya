'use client';

import { useState } from 'react';
import axios from 'axios';

interface PaymentData {
  orderId: number;
  paymentMethod: string;
  phoneNumber?: string;
  amount?: number | string; // Support both numeric amounts and payment IDs
}

interface PaymentResponse {
  success: boolean;
  message: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  amount?: number;
  originalAmount?: number | string;
  isPaymentId?: boolean;
}

interface PaymentStatusResponse {
  status: string;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  amount?: number;
  originalAmount?: number | string;
  phoneNumber?: string;
  resultDescription?: string;
  isPaymentId?: boolean;
}

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to validate payment ID format
  const isPaymentId = (value: any): boolean => {
    return typeof value === 'string' && /^[A-Z]{2}-\d{13}-\d{4}$/.test(value);
  };

  // Helper function to extract amount from payment ID
  const extractAmount = (amountOrId: number | string): number => {
    if (typeof amountOrId === 'number') {
      return amountOrId;
    }
    
    const match = amountOrId.match(/^[A-Z]{2}-(\d{13})-(\d{4})$/);
    if (match) {
      const amountInCents = parseInt(match[2], 10);
      return amountInCents / 100;
    }
    
    throw new Error(`Invalid payment amount or ID format: ${amountOrId}`);
  };

  const initiatePayment = async (data: PaymentData): Promise<PaymentResponse> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Validate payment amount/ID if provided
      if (data.amount !== undefined) {
        if (typeof data.amount === 'string' && !isPaymentId(data.amount)) {
          throw new Error('Invalid payment ID format. Expected format: XX-XXXXXXXXXXXXX-XXXX');
        }
      }

      const response = await axios.post<PaymentResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/initiate`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/status/${orderId}`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/retry/${orderId}`,
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
    isPaymentId,
    extractAmount,
  };
}