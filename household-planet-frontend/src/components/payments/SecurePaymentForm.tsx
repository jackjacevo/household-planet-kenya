'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCardIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const paymentSchema = z.object({
  cardNumber: z.string().regex(/^[0-9]{16}$/, 'Invalid card number'),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Invalid month'),
  expiryYear: z.string().regex(/^[0-9]{2}$/, 'Invalid year'),
  cvv: z.string().regex(/^[0-9]{3,4}$/, 'Invalid CVV'),
  cardholderName: z.string().min(2, 'Name required'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface SecurePaymentFormProps {
  amount: number | string; // Support both numeric amounts and payment IDs
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}

export default function SecurePaymentForm({ 
  amount, 
  onPaymentSuccess, 
  onPaymentError 
}: SecurePaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper functions to handle payment IDs
  const isPaymentId = (value: any): boolean => {
    return typeof value === 'string' && /^[A-Z]{2}-\d{13}-\d{4}$/.test(value);
  };

  const extractAmount = (amountOrId: number | string): number => {
    if (typeof amountOrId === 'number') {
      return amountOrId;
    }
    
    const match = amountOrId.match(/^[A-Z]{2}-(\d{13})-(\d{4})$/);
    if (match) {
      const amountInCents = parseInt(match[2], 10);
      return amountInCents / 100;
    }
    
    return 0; // Fallback
  };

  const displayAmount = extractAmount(amount);
  const showPaymentId = isPaymentId(amount);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const tokenizePaymentMethod = async (data: PaymentFormData) => {
    const response = await fetch('/api/payments/tokenize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardNumber: data.cardNumber,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cardholderName: data.cardholderName,
      }),
    });

    if (!response.ok) throw new Error('Tokenization failed');
    
    const result = await response.json();
    reset(); // Clear form data immediately
    
    return result.token;
  };

  const processPayment = async (token: string, cvv: string) => {
    const response = await fetch('/api/payments/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId: 'pi_temp',
        paymentToken: token,
        cvv,
      }),
    });

    if (!response.ok) throw new Error('Payment failed');
    return await response.json();
  };

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    
    try {
      const token = await tokenizePaymentMethod(data);
      const result = await processPayment(token, data.cvv);
      onPaymentSuccess(result);
    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center mb-4">
        <ShieldCheckIcon className="h-6 w-6 text-green-600 mr-2" />
        <span className="text-sm text-gray-600">PCI DSS Compliant</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <div className="relative">
            <input
              {...register('cardNumber')}
              type="text"
              placeholder="1234567890123456"
              maxLength={16}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <CreditCardIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          {errors.cardNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              {...register('expiryMonth')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">MM</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                  {String(i + 1).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              {...register('expiryYear')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">YY</option>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                  {String(new Date().getFullYear() + i).slice(-2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
            <input
              {...register('cvv')}
              type="password"
              placeholder="123"
              maxLength={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <input
            {...register('cardholderName')}
            type="text"
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.cardholderName && (
            <p className="text-red-500 text-xs mt-1">{errors.cardholderName.message}</p>
          )}
        </div>

        {showPaymentId && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Payment ID:</strong> {amount}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Amount extracted: KES {displayAmount.toLocaleString()}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {isProcessing ? 'Processing...' : `Pay KES ${displayAmount.toLocaleString()}`}
        </button>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>🔒 Your payment information is encrypted and secure</p>
        <p>We never store your card details</p>
      </div>
    </div>
  );
}
