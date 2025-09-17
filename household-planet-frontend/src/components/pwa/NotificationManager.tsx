'use client';

import { useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationManagerProps {
  children?: React.ReactNode;
}

export function NotificationManager({ children }: NotificationManagerProps) {
  const { subscribeToNotifications, showNotification } = usePWA();
  const { user } = useAuth();

  useEffect(() => {
    // Auto-subscribe to notifications when user logs in
    if (user && 'Notification' in window) {
      const setupNotifications = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const subscription = await subscribeToNotifications();
            if (subscription) {
              // Send subscription to backend
              try {
                const response = await fetch('/api/notifications/subscribe', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify({
                    subscription,
                    userId: user.id
                  })
                });
                
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
              } catch (error) {
                console.error('Failed to register push subscription:', error);
              }
            }
          }
        } catch (error) {
          console.error('Notification setup failed:', (error as Error).message);
        }
      };

      setupNotifications();
    }
  }, [user, subscribeToNotifications]);

  useEffect(() => {
    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        const { type, success } = event.data;
        
        if (type === 'CART_SYNCED' && success) {
          showNotification('Cart Updated', {
            body: 'Your cart has been synced successfully!',
            tag: 'cart-sync',
            silent: true
          });
        }
      };
      
      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [showNotification]);

  // Demo notification for development only
  // TODO: Remove in production or use feature flag
  useEffect(() => {
    const showDemoNotification = () => {
      if (user && 'Notification' in window && Notification.permission === 'granted') {
        setTimeout(() => {
          showNotification('Welcome to Household Planet Kenya!', {
            body: 'Thanks for installing our app. Enjoy shopping!',
            tag: 'welcome'
          } as any);
        }, 5000);
      }
    };

    if (user) {
      showDemoNotification();
    }
  }, [user, showNotification]);

  return <>{children}</>;
}

// Utility functions for different notification types
export const NotificationTypes = {
  orderConfirmed: (orderId: string) => ({
    title: 'Order Confirmed! 🎉',
    body: `Your order #${orderId} has been confirmed and is being processed.`,
    data: { type: 'order_confirmed', orderId },
    tag: `order-${orderId}`,
    actions: [
      { action: 'track', title: 'Track Order' },
      { action: 'close', title: 'Close' }
    ]
  }),

  orderShipped: (orderId: string, trackingNumber?: string) => ({
    title: 'Order Shipped! 🚚',
    body: trackingNumber 
      ? `Your order #${orderId} is on its way! Tracking: ${trackingNumber}`
      : `Your order #${orderId} is on its way!`,
    data: { type: 'order_shipped', orderId, trackingNumber },
    tag: `order-${orderId}`,
    actions: [
      { action: 'track', title: 'Track Order' },
      { action: 'close', title: 'Close' }
    ]
  }),

  orderDelivered: (orderId: string) => ({
    title: 'Order Delivered! ✅',
    body: `Your order #${orderId} has been delivered. How was your experience?`,
    data: { type: 'order_delivered', orderId },
    tag: `order-${orderId}`,
    requireInteraction: true,
    actions: [
      { action: 'review', title: 'Leave Review' },
      { action: 'close', title: 'Close' }
    ]
  }),

  flashSale: (discount: number, category?: string) => ({
    title: `Flash Sale! ${discount}% OFF 🔥`,
    body: category 
      ? `${discount}% off all ${category} items. Limited time only!`
      : `${discount}% off selected items. Limited time only!`,
    data: { type: 'flash_sale', discount, category },
    tag: 'flash-sale',
    actions: [
      { action: 'shop', title: 'Shop Now' },
      { action: 'close', title: 'Close' }
    ]
  }),

  lowStock: (productName: string, stock: number) => ({
    title: 'Hurry! Low Stock Alert 📦',
    body: `Only ${stock} left of "${productName}". Order now before it's gone!`,
    data: { type: 'low_stock', productName, stock },
    tag: 'low-stock',
    actions: [
      { action: 'shop', title: 'Order Now' },
      { action: 'close', title: 'Close' }
    ]
  })
};
