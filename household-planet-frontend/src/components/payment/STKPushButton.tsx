'use client';

import { Button } from '@/components/ui/Button';
import { Smartphone, RefreshCw } from 'lucide-react';
import { useSTKPush } from '@/hooks/useSTKPush';

interface STKPushButtonProps {
  orderId: number;
  orderStatus: string;
  paymentStatus?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
  onSuccess?: () => void;
}

export default function STKPushButton({ 
  orderId, 
  orderStatus, 
  paymentStatus, 
  size = 'sm',
  className = '',
  fullWidth = false,
  onSuccess
}: STKPushButtonProps) {
  const { initiateSTKPush, loading } = useSTKPush({
    onSuccess
  });

  // Show for all orders that aren't paid
  const shouldShow = paymentStatus !== 'PAID';

  const handleClick = () => {
    initiateSTKPush(orderId);
  };

  if (!shouldShow) return null;

  return (
    <Button
      variant="outline"
      size={size}
      className={`bg-green-50 border-green-200 text-green-700 hover:bg-green-100 ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={handleClick}
      disabled={loading}
    >
      <div className="icon-container">
        {loading ? (
          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Smartphone className="h-4 w-4 mr-1" />
        )}
      </div>
      {loading ? 'Sending...' : 'Pay via M-Pesa'}
    </Button>
  );
}
