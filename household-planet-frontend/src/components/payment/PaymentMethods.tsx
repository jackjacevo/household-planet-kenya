'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Smartphone, CreditCard, Banknote } from 'lucide-react';

interface PaymentMethodsProps {
  total: number;
  onPaymentSelect: (method: string, data?: any) => void;
  loading?: boolean;
}

export function PaymentMethods({ total, onPaymentSelect, loading }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState('MPESA');
  const [phoneNumber, setPhoneNumber] = useState('');

  const validatePhoneNumber = (phone: string): boolean => {
    const kenyanPhoneRegex = /^(\+?254|0)[17]\d{8}$/;
    return kenyanPhoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = () => {
    if (selectedMethod === 'MPESA') {
      if (!phoneNumber) {
        alert('Please enter your M-Pesa phone number');
        return;
      }
      if (!validatePhoneNumber(phoneNumber)) {
        alert('Please enter a valid Kenyan phone number (e.g., 254700000000 or 0700000000)');
        return;
      }
    }
    onPaymentSelect(selectedMethod, { phoneNumber });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Payment Method</h3>
      
      <div className="space-y-3">
        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="payment"
            value="MPESA"
            checked={selectedMethod === 'MPESA'}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="mr-3"
          />
          <Smartphone className="h-5 w-5 mr-3 text-green-600" />
          <div>
            <div className="font-medium">M-Pesa</div>
            <div className="text-sm text-gray-600">Pay with your M-Pesa mobile money</div>
          </div>
        </label>



        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="payment"
            value="CASH_ON_DELIVERY"
            checked={selectedMethod === 'CASH_ON_DELIVERY'}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="mr-3"
          />
          <Banknote className="h-5 w-5 mr-3 text-orange-600" />
          <div>
            <div className="font-medium">Cash on Delivery</div>
            <div className="text-sm text-gray-600">Pay when your order arrives</div>
          </div>
        </label>
      </div>

      {selectedMethod === 'MPESA' && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">M-Pesa Phone Number</label>
          <Input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="254700000000 or 0700000000"
            className={`w-full ${phoneNumber && !validatePhoneNumber(phoneNumber) ? 'border-red-500' : ''}`}
          />
          <p className="text-xs text-gray-600 mt-1">
            Enter your M-Pesa registered phone number
          </p>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? 'Processing...' : `Pay ${total.toLocaleString()} KSh`}
      </Button>
    </div>
  );
}