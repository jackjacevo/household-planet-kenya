import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { WhatsAppBusinessService } from './business.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('whatsapp/business')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
export class WhatsAppBusinessController {
  constructor(private businessService: WhatsAppBusinessService) {}

  // Business Hours Management
  @Post('hours')
  @Roles(UserRole.ADMIN)
  async setBusinessHours(@Body() hours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  }) {
    await this.businessService.setBusinessHours(hours);
    return { success: true };
  }

  @Get('hours')
  async getBusinessHours() {
    return this.businessService.getBusinessHours();
  }

  @Get('hours/status')
  async getBusinessStatus() {
    const isOpen = await this.businessService.isBusinessOpen();
    return { isOpen };
  }

  // Auto-Reply Management
  @Post('auto-reply')
  @Roles(UserRole.ADMIN)
  async setAutoReply(@Body() body: {
    type: 'business_hours' | 'after_hours' | 'welcome';
    message: string;
  }) {
    await this.businessService.setAutoReply(body.type, body.message);
    return { success: true };
  }

  @Get('auto-reply/:type')
  async getAutoReply(@Param('type') type: string) {
    return this.businessService.getAutoReply(type);
  }

  // Customer Segmentation
  @Post('segments')
  @Roles(UserRole.ADMIN)
  async createSegment(@Body() body: {
    name: string;
    criteria: {
      totalOrders?: { min?: number; max?: number };
      totalSpent?: { min?: number; max?: number };
      lastOrderDays?: number;
      location?: string[];
      hasWhatsApp?: boolean;
    };
  }) {
    return this.businessService.createCustomerSegment(body.name, body.criteria);
  }

  @Get('segments/:id/customers')
  async getSegmentCustomers(@Param('id') segmentId: string) {
    return this.businessService.getCustomersInSegment(segmentId);
  }

  // Broadcast Campaigns
  @Post('campaigns')
  @Roles(UserRole.ADMIN)
  async createCampaign(@Body() body: {
    name: string;
    message: string;
    segmentId?: string;
    phoneNumbers?: string[];
    scheduledAt?: string;
    mediaUrl?: string;
  }) {
    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : undefined;
    
    return this.businessService.createBroadcastCampaign({
      name: body.name,
      message: body.message,
      segmentId: body.segmentId,
      phoneNumbers: body.phoneNumbers,
      scheduledAt,
      mediaUrl: body.mediaUrl,
    });
  }

  @Post('campaigns/:id/execute')
  @Roles(UserRole.ADMIN)
  async executeCampaign(@Param('id') campaignId: string) {
    return this.businessService.executeCampaign(campaignId);
  }

  @Get('campaigns/:id/analytics')
  async getCampaignAnalytics(@Param('id') campaignId: string) {
    return this.businessService.getCampaignAnalytics(campaignId);
  }

  // Contact Management
  @Post('contacts')
  async addContact(@Body() body: {
    phoneNumber: string;
    name?: string;
    userId?: string;
  }) {
    return this.businessService.addContact(body.phoneNumber, body.name, body.userId);
  }

  @Put('contacts/:phoneNumber/opt-out')
  async optOutContact(@Param('phoneNumber') phoneNumber: string) {
    await this.businessService.optOutContact(phoneNumber);
    return { success: true };
  }

  @Put('contacts/:phoneNumber/opt-in')
  async optInContact(@Param('phoneNumber') phoneNumber: string) {
    await this.businessService.optInContact(phoneNumber);
    return { success: true };
  }

  @Get('contacts')
  async getContacts() {
    return this.businessService.getOptedInContacts();
  }

  // Analytics and Reporting
  @Get('analytics')
  async getBusinessAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    return this.businessService.getBusinessAnalytics(start, end);
  }

  // Quick Actions
  @Post('quick-actions/welcome')
  async sendWelcomeMessage(@Body() body: {
    phoneNumber: string;
    customerName?: string;
  }) {
    const success = await this.businessService.sendWelcomeMessage(
      body.phoneNumber,
      body.customerName,
    );
    return { success };
  }

  @Post('quick-actions/order-update')
  async sendOrderUpdate(@Body() body: {
    orderId: string;
    status: string;
    customMessage?: string;
  }) {
    const success = await this.businessService.sendOrderStatusUpdate(
      body.orderId,
      body.status,
      body.customMessage,
    );
    return { success };
  }

  // Bulk Operations
  @Post('bulk/welcome-messages')
  @Roles(UserRole.ADMIN)
  async sendBulkWelcomeMessages(@Body() body: {
    contacts: Array<{ phoneNumber: string; name?: string }>;
  }) {
    const results = await Promise.all(
      body.contacts.map(contact =>
        this.businessService.sendWelcomeMessage(contact.phoneNumber, contact.name)
      )
    );

    const successful = results.filter(r => r).length;
    return {
      total: body.contacts.length,
      successful,
      failed: body.contacts.length - successful,
    };
  }

  @Post('bulk/opt-out')
  @Roles(UserRole.ADMIN)
  async bulkOptOut(@Body() body: { phoneNumbers: string[] }) {
    const results = await Promise.all(
      body.phoneNumbers.map(phoneNumber =>
        this.businessService.optOutContact(phoneNumber).catch(() => false)
      )
    );

    const successful = results.filter(r => r).length;
    return {
      total: body.phoneNumbers.length,
      successful,
      failed: body.phoneNumbers.length - successful,
    };
  }

  // Template Quick Actions
  @Post('templates/quick-send')
  async sendTemplateMessage(@Body() body: {
    templateName: string;
    phoneNumbers: string[];
    variables: Record<string, any>;
  }) {
    // This would integrate with the template service
    return {
      message: 'Template messages queued for sending',
      recipients: body.phoneNumbers.length,
    };
  }

  // Performance Metrics
  @Get('metrics/performance')
  async getPerformanceMetrics(@Query('days') days: string = '30') {
    const daysNum = parseInt(days);
    const startDate = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const analytics = await this.businessService.getBusinessAnalytics(startDate, endDate);
    
    return {
      period: `${daysNum} days`,
      ...analytics,
      trends: {
        // Add trend calculations here
        messageGrowth: 0, // Calculate based on previous period
        contactGrowth: 0, // Calculate based on previous period
        engagementRate: 0, // Calculate based on responses
      },
    };
  }

  // Export Data
  @Get('export/contacts')
  @Roles(UserRole.ADMIN)
  async exportContacts() {
    const contacts = await this.businessService.getOptedInContacts();
    
    return {
      data: contacts,
      exportedAt: new Date(),
      totalContacts: contacts.length,
    };
  }

  @Get('export/analytics')
  @Roles(UserRole.ADMIN)
  async exportAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const analytics = await this.businessService.getBusinessAnalytics(start, end);
    
    return {
      period: { start, end },
      data: analytics,
      exportedAt: new Date(),
    };
  }
}