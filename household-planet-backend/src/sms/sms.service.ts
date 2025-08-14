import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey = process.env.AFRICAS_TALKING_API_KEY;
  private readonly username = process.env.AFRICAS_TALKING_USERNAME;
  private readonly baseUrl = 'https://api.africastalking.com/version1';

  constructor(private prisma: PrismaService) {}

  async sendSms(phoneNumber: string, message: string, type: string = 'GENERAL') {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messaging`,
        {
          username: this.username,
          to: this.formatPhoneNumber(phoneNumber),
          message,
        },
        {
          headers: {
            'apiKey': this.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      await this.logSms(phoneNumber, message, type, 'SENT');
      this.logger.log(`SMS sent to ${phoneNumber}: ${message.substring(0, 50)}...`);
      return true;
    } catch (error) {
      await this.logSms(phoneNumber, message, type, 'FAILED', error.message);
      this.logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
      return false;
    }
  }

  async sendOrderConfirmation(phoneNumber: string, orderNumber: string, total: number) {
    const message = `Order confirmed! #${orderNumber} - KSh ${total.toLocaleString()}. Track: https://householdplanet.co.ke/orders/${orderNumber}`;
    return this.sendSms(phoneNumber, message, 'ORDER_CONFIRMATION');
  }

  async sendPaymentConfirmation(phoneNumber: string, orderNumber: string, amount: number, method: string) {
    const message = `Payment received! KSh ${amount.toLocaleString()} via ${method} for order #${orderNumber}. Thank you!`;
    return this.sendSms(phoneNumber, message, 'PAYMENT_CONFIRMATION');
  }

  async sendShippingNotification(phoneNumber: string, orderNumber: string, trackingNumber?: string) {
    const message = trackingNumber 
      ? `Your order #${orderNumber} has shipped! Tracking: ${trackingNumber}. Delivery in 1-3 days.`
      : `Your order #${orderNumber} has shipped! Delivery in 1-3 days.`;
    return this.sendSms(phoneNumber, message, 'SHIPPING_NOTIFICATION');
  }

  async sendDeliveryNotification(phoneNumber: string, orderNumber: string, deliveryTime?: string) {
    const message = deliveryTime
      ? `Your order #${orderNumber} will be delivered ${deliveryTime}. Please be available.`
      : `Your order #${orderNumber} is out for delivery today. Please be available.`;
    return this.sendSms(phoneNumber, message, 'DELIVERY_NOTIFICATION');
  }

  async sendOtp(phoneNumber: string, otp: string) {
    const message = `Your Household Planet Kenya verification code is: ${otp}. Valid for 10 minutes. Do not share.`;
    
    await this.prisma.otpCode.create({
      data: {
        phoneNumber,
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    return this.sendSms(phoneNumber, message, 'OTP');
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<boolean> {
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        phoneNumber,
        code,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (otpRecord) {
      await this.prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
      return true;
    }

    return false;
  }

  async sendPromotionalSms(phoneNumbers: string[], message: string) {
    const results = await Promise.all(
      phoneNumbers.map(phone => this.sendSms(phone, message, 'PROMOTIONAL'))
    );
    
    const successful = results.filter(r => r).length;
    return {
      total: phoneNumbers.length,
      successful,
      failed: phoneNumbers.length - successful,
    };
  }

  async sendWishlistAlert(phoneNumber: string, productName: string) {
    const message = `Good news! ${productName} is back in stock. Order now: https://householdplanet.co.ke`;
    return this.sendSms(phoneNumber, message, 'WISHLIST_ALERT');
  }

  async sendDeliveryReminder(phoneNumber: string, orderNumber: string, deliveryDate: string) {
    const message = `Reminder: Your order #${orderNumber} is scheduled for delivery on ${deliveryDate}. Please be available.`;
    return this.sendSms(phoneNumber, message, 'DELIVERY_REMINDER');
  }

  @Cron('0 9 * * *') // Daily at 9 AM
  async processWishlistAlerts() {
    try {
      const wishlistItems = await this.prisma.wishlist.findMany({
        where: {
          product: {
            stock: { gt: 0 },
            isActive: true,
          },
        },
        include: {
          user: true,
          product: true,
        },
      });

      for (const item of wishlistItems) {
        if (item.user.phoneNumber) {
          await this.sendWishlistAlert(item.user.phoneNumber, item.product.name);
          
          // Wishlist notification sent - could add tracking if needed
        }
      }

      this.logger.log(`Processed ${wishlistItems.length} wishlist alerts`);
    } catch (error) {
      this.logger.error('Failed to process wishlist alerts:', error);
    }
  }

  @Cron('0 8 * * *') // Daily at 8 AM
  async processDeliveryReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);

      const deliveries = await this.prisma.order.findMany({
        where: {
          status: 'OUT_FOR_DELIVERY',
          estimatedDeliveryDate: {
            gte: tomorrow,
            lt: nextDay,
          },
        },
        include: { user: true },
      });

      for (const order of deliveries) {
        if (order.user?.phoneNumber) {
          await this.sendDeliveryReminder(
            order.user.phoneNumber,
            order.orderNumber,
            tomorrow.toLocaleDateString()
          );
        }
      }

      this.logger.log(`Sent ${deliveries.length} delivery reminders`);
    } catch (error) {
      this.logger.error('Failed to process delivery reminders:', error);
    }
  }

  async generateOtp(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private formatPhoneNumber(phoneNumber: string): string {
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return '+' + cleaned;
  }

  private async logSms(phoneNumber: string, message: string, type: string, status: string, error?: string) {
    try {
      await this.prisma.smsLog.create({
        data: {
          phoneNumber,
          message,
          type,
          status,
          error,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log SMS:', error);
    }
  }

  async getSmsStats() {
    const [total, sent, failed] = await Promise.all([
      this.prisma.smsLog.count(),
      this.prisma.smsLog.count({ where: { status: 'SENT' } }),
      this.prisma.smsLog.count({ where: { status: 'FAILED' } }),
    ]);

    return {
      total,
      sent,
      failed,
      deliveryRate: total > 0 ? (sent / total) * 100 : 0,
    };
  }
}