'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import axios from 'axios';

interface PartialPaymentProps {
  orderId: number;
  totalAmount: number;
  paidAmount: number;
  onPaymentSuccess: () => void;
}

export default function PartialPayment({ 
  orderId, 
  totalAmount, 
  paidAmount, 
  onPaymentSuccess 
}: PartialPaymentProps) {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const remainingAmount = totalAmount - paidAmount;

  const handlePartialPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0 || paymentAmount > remainingAmount) {
      alert('Invalid payment amount');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/partial`,
        {
          orderId,
          amount: paymentAmount,
          phoneNumber
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Partial payment initiated successfully');
        onPaymentSuccess();
      }
    } catch (error) {
      console.error('Error processing partial payment:', error);
      alert('Failed to process partial payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Make Partial Payment</h3>
      
      <div className="mb-4 p-4 bg-gray-50 rounded">
        <div className="flex justify-between mb-2">
          <span>Total Amount:</span>
          <span className="font-semibold">KSh {totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Paid Amount:</span>
          <span className="text-green-600">KSh {paidAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span>Remaining:</span>
          <span className="font-bold text-red-600">KSh {remainingAmount.toLocaleString()}</span>
        </div>
      </div>

      <form onSubmit={handlePartialPayment} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Payment Amount</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to pay"
            max={remainingAmount}
            min="1"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Maximum: KSh {remainingAmount.toLocaleString()}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">M-Pesa Phone Number</label>
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="254XXXXXXXXX"
            required
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading || !amount || !phoneNumber}
          className="w-full"
        >
          {loading ? 'Processing...' : `Pay KSh ${amount || '0'}`}
        </Button>
      </form>
    </div>
  );
}
