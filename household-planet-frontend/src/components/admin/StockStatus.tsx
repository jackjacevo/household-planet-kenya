'use client';

import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface StockStatusProps {
  stock: number;
  lowStockThreshold: number;
  trackStock: boolean;
  className?: string;
}

export default function StockStatus({ 
  stock, 
  lowStockThreshold, 
  trackStock, 
  className = '' 
}: StockStatusProps) {
  if (!trackStock) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="h-2 w-2 bg-gray-400 rounded-full mr-2"></div>
        <span className="text-sm text-gray-600">Not tracked</span>
      </div>
    );
  }

  const getStatusInfo = () => {
    if (stock === 0) {
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        text: 'Out of Stock',
        dotColor: 'bg-red-500'
      };
    } else if (stock <= lowStockThreshold) {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        text: 'Low Stock',
        dotColor: 'bg-yellow-500'
      };
    } else {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        text: 'In Stock',
        dotColor: 'bg-green-500'
      };
    }
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`h-2 w-2 ${status.dotColor} rounded-full mr-2`}></div>
      <span className={`text-sm font-medium ${status.color}`}>
        {stock} units
      </span>
      <span className="text-xs text-gray-500 ml-1">
        ({status.text})
      </span>
    </div>
  );
}
