'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function OrderDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
  }, []);

  const checkOrderFlow = async () => {
    const info: any = {};
    
    // Check authentication
    const token = localStorage.getItem('token');
    info.hasToken = !!token;
    info.tokenLength = token?.length || 0;
    
    // Check API connectivity
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/my-orders`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      info.apiStatus = response.status;
      info.apiStatusText = response.statusText;
      
      if (response.ok) {
        const data = await response.json();
        info.ordersCount = data.orders?.length || 0;
        info.ordersData = data;
      } else {
        info.errorResponse = await response.text();
      }
    } catch (error: any) {
      info.apiError = error.message;
    }
    
    // Check cart status
    try {
      const cartResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        info.cartItemsCount = cartData.items?.length || 0;
      }
    } catch (error: any) {
      info.cartError = error.message;
    }
    
    // Check localStorage flags
    info.orderCreatedFlag = localStorage.getItem('orderCreated');
    info.currentUrl = window.location.href;
    
    setDebugInfo(info);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold">Order Debug</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(false)}
          className="text-xs"
        >
          ×
        </Button>
      </div>
      
      <Button
        size="sm"
        onClick={checkOrderFlow}
        className="mb-2 w-full"
      >
        Check Order Flow
      </Button>
      
      {Object.keys(debugInfo).length > 0 && (
        <div className="text-xs space-y-1">
          <div>Token: {debugInfo.hasToken ? '✓' : '✗'}</div>
          <div>API Status: {debugInfo.apiStatus}</div>
          <div>Orders: {debugInfo.ordersCount}</div>
          <div>Cart Items: {debugInfo.cartItemsCount}</div>
          {debugInfo.apiError && (
            <div className="text-red-400">API Error: {debugInfo.apiError}</div>
          )}
          {debugInfo.errorResponse && (
            <div className="text-red-400">Error: {debugInfo.errorResponse}</div>
          )}
        </div>
      )}
    </div>
  );
}