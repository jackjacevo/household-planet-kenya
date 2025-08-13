import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PushService {
  constructor(private prisma: PrismaService) {}

  async subscribe(userId: string, subscription: any) {
    try {
      // Store subscription in database
      const result = await this.prisma.$executeRaw`
        INSERT OR REPLACE INTO push_subscriptions (user_id, subscription, active, created_at, updated_at)
        VALUES (${userId}, ${JSON.stringify(subscription)}, 1, datetime('now'), datetime('now'))
      `;
      return { success: true };
    } catch (error) {
      console.error('Push subscription error:', error);
      throw error;
    }
  }

  async sendNotification(userId: string, payload: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
  }) {
    try {
      // Get user subscription
      const subscription = await this.prisma.$queryRaw`
        SELECT subscription FROM push_subscriptions 
        WHERE user_id = ${userId} AND active = 1
      ` as any[];

      if (!subscription.length) {
        return { success: false, error: 'No active subscription' };
      }

      // In production, use web-push library to send notification
      console.log('Sending push notification:', payload);
      return { success: true };
    } catch (error) {
      console.error('Send notification error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendOrderUpdate(userId: string, orderId: string, status: string) {
    const statusMessages = {
      confirmed: 'Your order has been confirmed!',
      processing: 'Your order is being prepared',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered'
    };

    await this.sendNotification(userId, {
      title: 'Order Update',
      body: statusMessages[status] || 'Order status updated',
      url: `/orders/${orderId}`
    });
  }

  async sendAbandonedCartReminder(userId: string) {
    await this.sendNotification(userId, {
      title: 'Don\'t forget your items!',
      body: 'Complete your purchase and get fast delivery',
      url: '/cart'
    });
  }

  async sendPromotion(userId: string, title: string, message: string, url?: string) {
    await this.sendNotification(userId, {
      title,
      body: message,
      url: url || '/products'
    });
  }
}