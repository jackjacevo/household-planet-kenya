import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from './whatsapp.service';

@Injectable()
export class AbandonedCartService {
  private readonly logger = new Logger(AbandonedCartService.name);

  constructor(
    private prisma: PrismaService,
    private whatsappService: WhatsAppService,
  ) {}

  async trackAbandonedCart(userId?: string | number, sessionId?: string, phoneNumber?: string, cartItems?: any[]) {
    try {
      const userIdStr = userId ? (typeof userId === 'string' ? userId : String(userId)) : undefined;
      const cartData = JSON.stringify(cartItems || []);
      
      const existingCart = await this.prisma.abandonedCart.findFirst({
        where: {
          OR: [
            { userId: userIdStr || undefined },
            { sessionId: sessionId || undefined },
            { phoneNumber: phoneNumber || undefined },
          ],
          isRecovered: false,
        },
      });

      if (existingCart) {
        await this.prisma.abandonedCart.update({
          where: { id: existingCart.id },
          data: {
            cartData,
            updatedAt: new Date(),
          },
        });
      } else {
        await this.prisma.abandonedCart.create({
          data: {
            userId: userIdStr,
            sessionId,
            phoneNumber,
            cartData,
          },
        });
      }

      this.logger.log(`Tracked abandoned cart for ${userIdStr || sessionId || phoneNumber}`);
    } catch (error) {
      this.logger.error('Failed to track abandoned cart:', error);
    }
  }

  async markCartAsRecovered(userId?: string | number, sessionId?: string, phoneNumber?: string) {
    try {
      const userIdStr = userId ? (typeof userId === 'string' ? userId : String(userId)) : undefined;
      await this.prisma.abandonedCart.updateMany({
        where: {
          OR: [
            { userId: userIdStr || undefined },
            { sessionId: sessionId || undefined },
            { phoneNumber: phoneNumber || undefined },
          ],
          isRecovered: false,
        },
        data: {
          isRecovered: true,
          recoveredAt: new Date(),
        },
      });

      this.logger.log(`Marked cart as recovered for ${userIdStr || sessionId || phoneNumber}`);
    } catch (error) {
      this.logger.error('Failed to mark cart as recovered:', error);
    }
  }

  @Cron('0 */2 * * *') // Every 2 hours
  async sendAbandonedCartReminders() {
    try {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // First reminder after 2 hours
      const firstReminders = await this.prisma.abandonedCart.findMany({
        where: {
          isRecovered: false,
          remindersSent: 0,
          createdAt: {
            lte: twoHoursAgo,
            gte: twentyFourHoursAgo,
          },
          phoneNumber: { not: null },
        },
        include: {
          user: true,
        },
      });

      for (const cart of firstReminders) {
        const cartItems = JSON.parse(cart.cartData || '[]');
        if (cartItems.length > 0) {
          const success = await this.whatsappService.sendAbandonedCartReminder(
            cart.phoneNumber,
            cartItems,
            cart.userId,
          );

          if (success) {
            await this.prisma.abandonedCart.update({
              where: { id: cart.id },
              data: {
                remindersSent: 1,
                lastReminderAt: new Date(),
              },
            });
          }
        }
      }

      // Second reminder after 24 hours
      const secondReminders = await this.prisma.abandonedCart.findMany({
        where: {
          isRecovered: false,
          remindersSent: 1,
          lastReminderAt: {
            lte: twentyFourHoursAgo,
          },
          phoneNumber: { not: null },
        },
        include: {
          user: true,
        },
      });

      for (const cart of secondReminders) {
        const cartItems = JSON.parse(cart.cartData || '[]');
        if (cartItems.length > 0) {
          const message = `🛒 Last chance!\n\nYour cart is still waiting with ${cartItems.length} item${cartItems.length > 1 ? 's' : ''}.\n\nGet 10% OFF with code COMEBACK10\n\n🔗 Complete your order: https://householdplanet.co.ke/cart`;
          
          const success = await this.whatsappService.sendMessage(
            cart.phoneNumber,
            message,
            'ABANDONED_CART',
            null,
            cart.userId,
          );

          if (success) {
            await this.prisma.abandonedCart.update({
              where: { id: cart.id },
              data: {
                remindersSent: 2,
                lastReminderAt: new Date(),
              },
            });
          }
        }
      }

      this.logger.log(`Sent ${firstReminders.length} first reminders and ${secondReminders.length} second reminders`);
    } catch (error) {
      this.logger.error('Failed to send abandoned cart reminders:', error);
    }
  }

  async getAbandonedCartStats() {
    const [total, recovered, withReminders] = await Promise.all([
      this.prisma.abandonedCart.count(),
      this.prisma.abandonedCart.count({ where: { isRecovered: true } }),
      this.prisma.abandonedCart.count({ where: { remindersSent: { gt: 0 } } }),
    ]);

    const recoveryRate = total > 0 ? (recovered / total) * 100 : 0;

    return {
      total,
      recovered,
      withReminders,
      recoveryRate: Math.round(recoveryRate * 100) / 100,
    };
  }
}