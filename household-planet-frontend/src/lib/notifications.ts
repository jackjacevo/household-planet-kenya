'use client';

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
}

export class NotificationManager {
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async showNotification(data: NotificationData): Promise<void> {
    if (!('serviceWorker' in navigator)) return;
    
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/badge-72x72.png',
      tag: data.tag,
      data: data.data,
      actions: data.actions,
      vibrate: [100, 50, 100],
      requireInteraction: true
    });
  }

  static async scheduleOrderUpdate(orderId: string, status: string): Promise<void> {
    const notifications = {
      'CONFIRMED': {
        title: 'Order Confirmed! 🎉',
        body: `Your order #${orderId} has been confirmed and is being prepared.`,
        tag: `order-${orderId}`,
        data: { orderId, type: 'order_update' }
      },
      'SHIPPED': {
        title: 'Order Shipped! 📦',
        body: `Your order #${orderId} is on its way to you.`,
        tag: `order-${orderId}`,
        data: { orderId, type: 'order_update' }
      },
      'DELIVERED': {
        title: 'Order Delivered! ✅',
        body: `Your order #${orderId} has been delivered. Enjoy your purchase!`,
        tag: `order-${orderId}`,
        data: { orderId, type: 'order_update' }
      }
    };

    const notification = notifications[status as keyof typeof notifications];
    if (notification) {
      await this.showNotification(notification);
    }
  }

  static async scheduleAbandonedCartReminder(cartItems: number): Promise<void> {
    // Schedule for 1 hour later
    setTimeout(async () => {
      await this.showNotification({
        title: 'Don\'t forget your cart! 🛒',
        body: `You have ${cartItems} item${cartItems > 1 ? 's' : ''} waiting for you.`,
        tag: 'abandoned-cart',
        data: { type: 'abandoned_cart' },
        actions: [
          { action: 'view-cart', title: 'View Cart' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
    }, 3600000); // 1 hour
  }

  static async schedulePromotion(title: string, body: string, promoCode?: string): Promise<void> {
    await this.showNotification({
      title,
      body,
      tag: 'promotion',
      data: { type: 'promotion', promoCode },
      actions: [
        { action: 'shop-now', title: 'Shop Now' },
        { action: 'dismiss', title: 'Not Now' }
      ]
    });
  }

  static async subscribeToNotifications(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
