import { Controller, Get, Post, Body, Query, UseGuards, Param } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { AbandonedCartService } from './abandoned-cart.service';
import { WhatsAppTemplateService } from './template.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(
    private whatsappService: WhatsAppService,
    private abandonedCartService: AbandonedCartService,
    private templateService: WhatsAppTemplateService,
  ) {}

  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getStatus() {
    return {
      isReady: this.whatsappService.isClientReady(),
      qrCode: this.whatsappService.getQRCode(),
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getStats() {
    const [messageStats, cartStats] = await Promise.all([
      this.whatsappService.getMessageStats(),
      this.abandonedCartService.getAbandonedCartStats(),
    ]);

    return {
      messages: messageStats,
      abandonedCarts: cartStats,
    };
  }

  @Get('messages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getMessages(
    @Query('phoneNumber') phoneNumber?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.whatsappService.getMessageHistory(
      phoneNumber,
      userId,
      limit ? parseInt(limit) : 50,
    );
  }

  @Post('send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async sendMessage(@Body() body: {
    phoneNumber: string;
    message: string;
    type?: string;
    userId?: string;
    mediaUrl?: string;
  }) {
    const success = await this.whatsappService.sendMessage(
      body.phoneNumber,
      body.message,
      body.type || 'MANUAL',
      null,
      body.userId,
      body.mediaUrl,
    );

    return { success };
  }

  @Post('send-promotional')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async sendPromotional(@Body() body: {
    phoneNumbers: string[];
    title: string;
    description: string;
    link?: string;
  }) {
    const results = await Promise.all(
      body.phoneNumbers.map(phoneNumber =>
        this.whatsappService.sendPromotionalMessage(
          phoneNumber,
          body.title,
          body.description,
          body.link,
        )
      )
    );

    const successful = results.filter(r => r).length;
    return {
      total: body.phoneNumbers.length,
      successful,
      failed: body.phoneNumbers.length - successful,
    };
  }

  @Public()
  @Post('abandoned-cart/track')
  async trackAbandonedCart(@Body() body: {
    userId?: string;
    sessionId?: string;
    phoneNumber?: string;
    cartItems?: any[];
  }) {
    await this.abandonedCartService.trackAbandonedCart(
      body.userId,
      body.sessionId,
      body.phoneNumber,
      body.cartItems,
    );

    return { success: true };
  }

  @Public()
  @Post('abandoned-cart/recovered')
  async markCartRecovered(@Body() body: {
    userId?: string;
    sessionId?: string;
    phoneNumber?: string;
  }) {
    await this.abandonedCartService.markCartAsRecovered(
      body.userId,
      body.sessionId,
      body.phoneNumber,
    );

    return { success: true };
  }

  @Get('templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getTemplates() {
    return this.templateService.getAllTemplates();
  }

  @Get('templates/:name')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getTemplate(@Param('name') name: string) {
    return this.templateService.getTemplate(name);
  }

  @Post('templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createTemplate(@Body() body: {
    name: string;
    type: string;
    template: string;
  }) {
    return this.templateService.createTemplate(body.name, body.type, body.template);
  }

  @Post('templates/:name')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateTemplate(
    @Param('name') name: string,
    @Body() body: { template: string }
  ) {
    return this.templateService.updateTemplate(name, body.template);
  }

  @Post('templates/seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async seedTemplates() {
    await this.templateService.seedDefaultTemplates();
    return { success: true };
  }

  // Public endpoint for WhatsApp contact button
  @Public()
  @Get('contact-info')
  getContactInfo() {
    return {
      whatsappNumber: process.env.WHATSAPP_BUSINESS_NUMBER || '+254700000000',
      message: 'Hello! I\'m interested in your products.',
      link: `https://wa.me/${process.env.WHATSAPP_BUSINESS_NUMBER?.replace('+', '') || '254700000000'}?text=Hello!%20I'm%20interested%20in%20your%20products.`,
    };
  }

  @Public()
  @Post('quick-inquiry')
  async sendQuickInquiry(@Body() body: {
    phoneNumber: string;
    productName?: string;
    productUrl?: string;
    message?: string;
  }) {
    const businessNumber = process.env.WHATSAPP_BUSINESS_NUMBER || '+254700000000';
    let inquiryMessage = `New product inquiry from ${body.phoneNumber}:\n\n`;
    
    if (body.productName) {
      inquiryMessage += `Product: ${body.productName}\n`;
    }
    
    if (body.productUrl) {
      inquiryMessage += `URL: ${body.productUrl}\n`;
    }
    
    if (body.message) {
      inquiryMessage += `Message: ${body.message}\n`;
    }

    const success = await this.whatsappService.sendMessage(
      businessNumber.replace('+', ''),
      inquiryMessage,
      'INQUIRY',
    );

    return { success };
  }
}