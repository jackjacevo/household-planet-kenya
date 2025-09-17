'use client';

import { useEffect, useState } from 'react';

export function PaymentIcons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex space-x-3 sm:space-x-6">
        <div className="h-6 w-10 bg-green-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">M-PESA</span>
        </div>
        <div className="h-6 w-10 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">VISA</span>
        </div>
        <div className="h-6 w-10 bg-red-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">MC</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex space-x-3 sm:space-x-6">
      {/* M-Pesa */}
      <div className="h-8 w-16 bg-green-600 rounded-md flex items-center justify-center shadow-sm">
        <span className="text-white text-xs font-bold tracking-tight">M-PESA</span>
      </div>
      {/* Visa */}
      <div className="h-8 w-16 bg-blue-700 rounded-md flex items-center justify-center shadow-sm">
        <span className="text-white text-sm font-bold italic tracking-wider">VISA</span>
      </div>
      {/* Mastercard */}
      <div className="h-8 w-16 bg-gradient-to-r from-red-600 to-orange-500 rounded-md flex items-center justify-center shadow-sm">
        <div className="flex items-center space-x-0.5">
          <div className="w-3 h-3 bg-red-500 rounded-full opacity-90"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full opacity-90 -ml-1"></div>
        </div>
      </div>
    </div>
  );
}
