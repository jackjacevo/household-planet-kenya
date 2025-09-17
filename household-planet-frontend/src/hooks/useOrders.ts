'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  product: any;
  variant?: any;
  quantity: number;
  price: number;
}

export const useOrders = (autoFetch: boolean = true) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      // Don't throw error for admin routes to prevent breaking admin dashboard
      if (!isAdminRoute && error?.response?.status !== 400) {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (orderData: any) => {
    setIsLoading(true);
    try {
      const response = await api.post('/orders', orderData);
      if (autoFetch && !isAdminRoute) {
        await fetchOrders();
      }
      return response.data;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const trackOrder = async (orderNumber: string) => {
    try {
      const response = await api.get(`/orders/track/${orderNumber}`);
      return response.data;
    } catch (error) {
      console.error('Failed to track order:', error);
      throw error;
    }
  };

  const requestReturn = async (orderId: number, itemIds: number[], reason: string, description?: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/orders/returns', {
        orderId,
        itemIds,
        reason,
        description
      });
      if (autoFetch && !isAdminRoute) {
        await fetchOrders();
      }
      return response.data;
    } catch (error) {
      console.error('Failed to request return:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only auto-fetch if not in admin route and autoFetch is enabled
    if (autoFetch && !isAdminRoute) {
      fetchOrders();
    }
  }, [autoFetch, isAdminRoute]);

  return {
    orders,
    isLoading,
    fetchOrders,
    createOrder,
    trackOrder,
    requestReturn
  };
};
