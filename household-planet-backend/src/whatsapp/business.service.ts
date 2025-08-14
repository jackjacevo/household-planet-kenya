import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppTemplateService } from './template.service';

@Injectable()
export class WhatsAppBusinessService {
  private readonly logger = new Logger(WhatsAppBusinessService.name);

  constructor(
    private prisma: PrismaService,
    private whatsappService: WhatsAppService,
    private templateService: WhatsAppTemplateService,
  ) {}

  // Business Hours Management
  async setBusinessHours(hours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  }) {
    await this.prisma.whatsAppBusinessSettings.upsert({
      where: { id: 'default' },
      update: { businessHours: JSON.stringify(hours) },
      create: { id: 'default', businessHours: JSON.stringify(hours) },
    });
  }

  async getBusinessHours() {
    const settings = await this.prisma.whatsAppBusinessSettings.findFirst();
    return settings?.businessHours ? JSON.parse(settings.businessHours) : null;
  }

  async isBusinessOpen(): Promise<boolean> {
    const hours = await this.getBusinessHours();
    if (!hours) return true; // Default to always open if not set

    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const todayHours = hours[dayName];
    if (!todayHours || !todayHours.isOpen) return false;

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  }

  // Auto-Reply System
  async setAutoReply(type: 'business_hours' | 'after_hours' | 'welcome', message: string) {
    await this.prisma.whatsAppAutoReply.upsert({
      where: { type },
      update: { message, isActive: true },
      create: { type, message, isActive: true },
    });
  }

  async getAutoReply(type: string) {
    return this.prisma.whatsAppAutoReply.findUnique({
      where: { type },
    });
  }

  async sendAutoReply(phoneNumber: string, type: string) {
    const autoReply = await this.getAutoReply(type);
    if (autoReply && autoReply.isActive) {
      return this.whatsappService.sendMessage(
        phoneNumber,
        autoReply.message,
        'AUTO_REPLY'
      );
    }
    return false;
  }

  // Customer Segmentation
  async createCustomerSegment(name: string, criteria: {
    totalOrders?: { min?: number; max?: number };
    totalSpent?: { min?: number; max?: number };
    lastOrderDays?: number;
    location?: string[];
    hasWhatsApp?: boolean;
  }) {
    return this.prisma.whatsAppCustomerSegment.create({
      data: {
        name,
        criteria: JSON.stringify(criteria),
      },
    });
  }

  async getCustomersInSegment(segmentId: string) {
    const segment = await this.prisma.whatsAppCustomerSegment.findUnique({
      where: { id: segmentId },
    });

    if (!segment) return [];

    const criteria = JSON.parse(segment.criteria);
    
    // Build dynamic query based on criteria
    const whereClause: any = {};
    
    if (criteria.totalOrders) {
      whereClause.orders = {
        _count: {
          gte: criteria.totalOrders.min || 0,
          lte: criteria.totalOrders.max || 999999,
        },
      };
    }

    if (criteria.hasWhatsApp) {
      whereClause.phoneNumber = { not: null };
    }

    return this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        _count: {
          select: { orders: true },
        },
      },
    });
  }

  // Broadcast Campaigns
  async createBroadcastCampaign(data: {
    name: string;
    message: string;
    segmentId?: string;
    phoneNumbers?: string[];
    scheduledAt?: Date;
    mediaUrl?: string;
  }) {
    const campaign = await this.prisma.whatsAppCampaign.create({
      data: {
        name: data.name,
        message: data.message,
        segmentId: data.segmentId,
        phoneNumbers: data.phoneNumbers ? JSON.stringify(data.phoneNumbers) : null,
        scheduledAt: data.scheduledAt,
        mediaUrl: data.mediaUrl,
        status: data.scheduledAt ? 'SCHEDULED' : 'DRAFT',
      },
    });

    // If not scheduled, send immediately
    if (!data.scheduledAt) {
      await this.executeCampaign(campaign.id);
    }

    return campaign;
  }

  async executeCampaign(campaignId: string) {
    const campaign = await this.prisma.whatsAppCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) throw new Error('Campaign not found');

    let phoneNumbers: string[] = [];

    if (campaign.segmentId) {
      const customers = await this.getCustomersInSegment(campaign.segmentId);
      phoneNumbers = customers
        .filter(c => c.phoneNumber)
        .map(c => c.phoneNumber!);
    } else if (campaign.phoneNumbers) {
      phoneNumbers = JSON.parse(campaign.phoneNumbers);
    }

    // Update campaign status
    await this.prisma.whatsAppCampaign.update({
      where: { id: campaignId },
      data: { 
        status: 'SENDING',
        sentAt: new Date(),
        totalRecipients: phoneNumbers.length,
      },
    });

    let successCount = 0;
    let failureCount = 0;

    // Send messages with delay to avoid rate limiting
    for (const phoneNumber of phoneNumbers) {
      try {
        const success = await this.whatsappService.sendMessage(
          phoneNumber,
          campaign.message,
          'CAMPAIGN',
          null,
          null,
          campaign.mediaUrl || undefined
        );

        if (success) {
          successCount++;
        } else {
          failureCount++;
        }

        // Add delay between messages (1 second)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        failureCount++;
        this.logger.error(`Failed to send campaign message to ${phoneNumber}:`, error);
      }
    }

    // Update campaign results
    await this.prisma.whatsAppCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'COMPLETED',
        successfulSends: successCount,
        failedSends: failureCount,
        completedAt: new Date(),
      },
    });

    return { successCount, failureCount, total: phoneNumbers.length };
  }

  // Contact Management
  async addContact(phoneNumber: string, name?: string, userId?: string) {
    return this.prisma.whatsAppContact.upsert({
      where: { phoneNumber },
      update: { 
        name: name || undefined,
        userId: userId || undefined,
        updatedAt: new Date(),
      },
      create: {
        phoneNumber,
        name,
        userId,
        isOptedIn: true,
      },
    });
  }

  async optOutContact(phoneNumber: string) {
    return this.prisma.whatsAppContact.update({
      where: { phoneNumber },
      data: { 
        isOptedIn: false,
        optedOutAt: new Date(),
      },
    });
  }

  async optInContact(phoneNumber: string) {
    return this.prisma.whatsAppContact.update({
      where: { phoneNumber },
      data: { 
        isOptedIn: true,
        optedOutAt: null,
      },
    });
  }

  async getOptedInContacts() {
    return this.prisma.whatsAppContact.findMany({
      where: { isOptedIn: true },
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

  // Analytics and Reporting
  async getCampaignAnalytics(campaignId: string) {
    const campaign = await this.prisma.whatsAppCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) return null;

    const messages = await this.prisma.whatsAppMessage.findMany({
      where: { 
        type: 'CAMPAIGN',
        createdAt: {
          gte: campaign.sentAt || campaign.createdAt,
          lte: campaign.completedAt || new Date(),
        },
      },
    });

    return {
      campaign,
      totalSent: messages.filter(m => m.status === 'SENT').length,
      totalFailed: messages.filter(m => m.status === 'FAILED').length,
      deliveryRate: campaign.totalRecipients ? 
        (campaign.successfulSends / campaign.totalRecipients) * 100 : 0,
    };
  }

  async getBusinessAnalytics(startDate: Date, endDate: Date) {
    const [
      totalMessages,
      sentMessages,
      failedMessages,
      campaigns,
      contacts,
      optedOutContacts,
    ] = await Promise.all([
      this.prisma.whatsAppMessage.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.whatsAppMessage.count({
        where: {
          status: 'SENT',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.whatsAppMessage.count({
        where: {
          status: 'FAILED',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.whatsAppCampaign.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.whatsAppContact.count({
        where: { isOptedIn: true },
      }),
      this.prisma.whatsAppContact.count({
        where: { isOptedIn: false },
      }),
    ]);

    return {
      messages: {
        total: totalMessages,
        sent: sentMessages,
        failed: failedMessages,
        deliveryRate: totalMessages > 0 ? (sentMessages / totalMessages) * 100 : 0,
      },
      campaigns,
      contacts: {
        total: contacts + optedOutContacts,
        optedIn: contacts,
        optedOut: optedOutContacts,
        optInRate: (contacts + optedOutContacts) > 0 ? 
          (contacts / (contacts + optedOutContacts)) * 100 : 0,
      },
    };
  }

  // Quick Actions
  async sendWelcomeMessage(phoneNumber: string, customerName?: string) {
    const template = await this.templateService.renderTemplate('welcome_message', {
      customerName: customerName || 'Valued Customer',
      shopUrl: 'https://householdplanet.co.ke',
    });

    return this.whatsappService.sendMessage(
      phoneNumber,
      template,
      'WELCOME',
    );
  }

  async sendOrderStatusUpdate(orderId: string, status: string, customMessage?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order || !order.user?.phoneNumber) return false;

    let message = customMessage;
    if (!message) {
      const statusMessages = {
        PROCESSING: 'Your order is being processed and will be shipped soon.',
        SHIPPED: 'Great news! Your order has been shipped and is on its way.',
        OUT_FOR_DELIVERY: 'Your order is out for delivery and will arrive today.',
        DELIVERED: 'Your order has been successfully delivered. Thank you for shopping with us!',
      };
      message = statusMessages[status] || `Your order status has been updated to: ${status}`;
    }

    const fullMessage = `📦 Order Update\n\nOrder #${order.orderNumber}\n${message}\n\nTrack your order: https://householdplanet.co.ke/orders/${order.orderNumber}`;

    return this.whatsappService.sendMessage(
      order.user.phoneNumber,
      fullMessage,
      'ORDER_UPDATE',
      orderId,
      order.userId,
    );
  }
}