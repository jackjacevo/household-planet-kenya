import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface WhatsAppInquiryDto {
  productId: number;
  productName: string;
  productPrice: number;
  sku: string;
  timestamp: string;
  sessionId: string;
}

@Injectable()
export class WhatsAppAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async trackInquiry(dto: WhatsAppInquiryDto) {
    await this.prisma.analyticsEvent.create({
      data: {
        event: 'whatsapp_product_inquiry',
        properties: JSON.stringify({
          productId: dto.productId,
          productName: dto.productName,
          productPrice: dto.productPrice,
          sku: dto.sku
        }),
        sessionId: dto.sessionId,
        timestamp: new Date(dto.timestamp)
      }
    });

    return { success: true };
  }

  async getWhatsAppInquiries(startDate?: Date, endDate?: Date) {
    const where: any = {
      event: 'whatsapp_product_inquiry'
    };

    if (startDate && endDate) {
      where.timestamp = {
        gte: startDate,
        lte: endDate
      };
    }

    const inquiries = await this.prisma.analyticsEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' }
    });

    return inquiries.map(inquiry => ({
      ...inquiry,
      properties: JSON.parse(inquiry.properties)
    }));
  }
}