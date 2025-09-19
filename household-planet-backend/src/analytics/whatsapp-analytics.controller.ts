import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/index';
import { WhatsAppAnalyticsService } from './whatsapp-analytics.service';

export class WhatsAppInquiryDto {
  productId: number;
  productName: string;
  productPrice: number;
  sku: string;
  timestamp: string;
  sessionId: string;
}

@Controller('analytics')
export class WhatsAppAnalyticsController {
  constructor(private whatsAppAnalyticsService: WhatsAppAnalyticsService) {}

  @Post('whatsapp-inquiry')
  async trackWhatsAppInquiry(@Body() dto: WhatsAppInquiryDto) {
    return this.whatsAppAnalyticsService.trackInquiry(dto);
  }

  @Get('whatsapp-inquiries')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  async getWhatsAppInquiries() {
    return this.whatsAppAnalyticsService.getWhatsAppInquiries();
  }
}
