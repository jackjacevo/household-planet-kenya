import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppService.name);
  private client: Client;
  private isReady = false;
  private qrCode: string;

  constructor(private prisma: PrismaService) {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });
  }

  async onModuleInit() {
    await this.initializeWhatsApp();
  }

  private async initializeWhatsApp() {
    this.client.on('qr', async (qr) => {
      this.logger.log('QR Code received');
      this.qrCode = await QRCode.toDataURL(qr);
    });

    this.client.on('ready', () => {
      this.logger.log('WhatsApp client is ready!');
      this.isReady = true;
    });

    this.client.on('authenticated', () => {
      this.logger.log('WhatsApp client authenticated');
    });

    this.client.on('auth_failure', (msg) => {
      this.logger.error('Authentication failed:', msg);
    });

    this.client.on('disconnected', (reason) => {
      this.logger.warn('WhatsApp client disconnected:', reason);
      this.isReady = false;
    });

    await this.client.initialize();
  }

  getQRCode(): string {
    return this.qrCode;
  }

  isClientReady(): boolean {
    return this.isReady;
  }

  async sendMessage(phoneNumber: string, message: string, type: string, orderId?: string, userId?: string | number, mediaUrl?: string): Promise<boolean> {
    const userIdStr = userId ? (typeof userId === 'string' ? userId : String(userId)) : undefined;
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp client is not ready');
      }

      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      let sentMessage;

      if (mediaUrl) {
        const media = await MessageMedia.fromUrl(mediaUrl);
        sentMessage = await this.client.sendMessage(formattedNumber, media, { caption: message });
      } else {
        sentMessage = await this.client.sendMessage(formattedNumber, message);
      }

      await this.logMessage(phoneNumber, message, type, 'SENT', orderId, userIdStr, mediaUrl);
      this.logger.log(`Message sent to ${phoneNumber}: ${message.substring(0, 50)}...`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send message to ${phoneNumber}:`, error);
      await this.logMessage(phoneNumber, message, type, 'FAILED', orderId, userIdStr, mediaUrl, error.message);
      return false;
    }
  }

  async sendOrderConfirmation(phoneNumber: string, orderNumber: string, total: number, orderId: string, userId?: string | number): Promise<boolean> {
    const message = `🎉 Order Confirmed!\n\nOrder #${orderNumber}\nTotal: KSh ${total.toLocaleString()}\n\nThank you for shopping with Household Planet Kenya! We'll keep you updated on your delivery.\n\nTrack your order: https://householdplanet.co.ke/orders/${orderNumber}`;
    
    return this.sendMessage(phoneNumber, message, 'ORDER_CONFIRMATION', orderId, userId);
  }

  async sendDeliveryUpdate(phoneNumber: string, orderNumber: string, status: string, location?: string, orderId?: string, userId?: string | number): Promise<boolean> {
    let message = `📦 Delivery Update\n\nOrder #${orderNumber}\nStatus: ${status}`;
    
    if (location) {
      message += `\nLocation: ${location}`;
    }
    
    message += `\n\nTrack your order: https://householdplanet.co.ke/orders/${orderNumber}`;
    
    return this.sendMessage(phoneNumber, message, 'DELIVERY_UPDATE', orderId, userId);
  }

  async sendAbandonedCartReminder(phoneNumber: string, cartItems: any[], userId?: string | number): Promise<boolean> {
    const itemCount = cartItems.length;
    const totalValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const message = `🛒 Don't forget your cart!\n\nYou have ${itemCount} item${itemCount > 1 ? 's' : ''} waiting for you (KSh ${totalValue.toLocaleString()})\n\nComplete your purchase now and get FREE delivery on orders over KSh 2,000!\n\n🔗 Continue shopping: https://householdplanet.co.ke/cart`;
    
    return this.sendMessage(phoneNumber, message, 'ABANDONED_CART', null, userId);
  }

  async sendPromotionalMessage(phoneNumber: string, title: string, description: string, link?: string, userId?: string | number): Promise<boolean> {
    let message = `🎁 ${title}\n\n${description}`;
    
    if (link) {
      message += `\n\n🔗 Shop now: ${link}`;
    }
    
    return this.sendMessage(phoneNumber, message, 'PROMOTIONAL', null, userId);
  }

  async sendSupportMessage(phoneNumber: string, ticketId: string, response: string, userId?: string | number): Promise<boolean> {
    const message = `💬 Support Response\n\nTicket #${ticketId}\n\n${response}\n\nNeed more help? Reply to this message or visit: https://householdplanet.co.ke/support`;
    
    return this.sendMessage(phoneNumber, message, 'SUPPORT', null, userId);
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle Kenyan numbers
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      // Already in correct format
    } else if (cleaned.length === 9) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned + '@c.us';
  }

  private async logMessage(
    phoneNumber: string,
    message: string,
    type: string,
    status: string,
    orderId?: string,
    userId?: string,
    mediaUrl?: string,
    failureReason?: string
  ) {
    try {
      await this.prisma.whatsAppMessage.create({
        data: {
          phoneNumber,
          message,
          type,
          status,
          orderId,
          userId,
          mediaUrl,
          failureReason,
          sentAt: status === 'SENT' ? new Date() : null,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log WhatsApp message:', error);
    }
  }

  async getMessageHistory(phoneNumber?: string, userId?: string | number, limit = 50) {
    const userIdStr = userId ? (typeof userId === 'string' ? userId : String(userId)) : undefined;
    return this.prisma.whatsAppMessage.findMany({
      where: {
        ...(phoneNumber && { phoneNumber }),
        ...(userIdStr && { userId: userIdStr }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getMessageStats() {
    const [total, sent, failed, pending] = await Promise.all([
      this.prisma.whatsAppMessage.count(),
      this.prisma.whatsAppMessage.count({ where: { status: 'SENT' } }),
      this.prisma.whatsAppMessage.count({ where: { status: 'FAILED' } }),
      this.prisma.whatsAppMessage.count({ where: { status: 'PENDING' } }),
    ]);

    return { total, sent, failed, pending };
  }
}