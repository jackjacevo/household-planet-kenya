'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tag, X, Check, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface PromoCodeProps {
  subtotal: number;
  onPromoApplied: (discount: number, code: string) => void;
  onPromoRemoved: () => void;
  appliedPromo?: { code: string; discount: number } | null;
}

export function PromoCode({ 
  subtotal, 
  onPromoApplied, 
  onPromoRemoved, 
  appliedPromo 
}: PromoCodeProps) {
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/promo-codes/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: promoCode.trim(),
          orderAmount: subtotal
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.valid) {
        onPromoApplied(data.discount, promoCode.trim());
        setPromoCode('');
      } else {
        setError(data.message || 'Invalid promo code');
      }
    } catch (err) {
      setError('Failed to apply promo code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removePromoCode = () => {
    onPromoRemoved();
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyPromoCode();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Tag className="h-5 w-5 mr-2 text-orange-500" />
        Promo Code
      </h3>
      
      {appliedPromo ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-800">{appliedPromo.code}</p>
                <p className="text-sm text-green-600">
                  -{formatPrice(appliedPromo.discount)} discount applied
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={removePromoCode}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            </div>
            <Button 
              onClick={applyPromoCode} 
              disabled={!promoCode.trim() || loading}
            >
              {loading ? 'Applying...' : 'Apply'}
            </Button>
          </div>
          
          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              No promo codes are currently available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}