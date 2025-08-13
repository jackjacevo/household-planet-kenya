import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from './sms.service';

@Injectable()
export class TrackingService {
  constructor(
    private prisma: PrismaService,
    private smsService: SmsService
  ) {}

  async createTracking(orderId: string) {
    return this.prisma.deliveryTracking.create({
      data: { orderId, status: 'ORDER_PLACED' }
    });
  }

  async updateStatus(orderId: string, status: string, location?: string, notes?: string) {
    const tracking = await this.prisma.deliveryTracking.update({
      where: { orderId },
      data: { status, location, notes, updatedAt: new Date() },
      include: { order: { include: { user: true } } }
    });

    // Add update record
    await this.prisma.deliveryUpdate.create({
      data: { trackingId: tracking.id, status, location, notes }
    });

    // Send SMS notification
    if (tracking.order.user.phone) {
      await this.smsService.sendDeliveryUpdate(
        tracking.order.user.phone,
        tracking.order.orderNumber,
        status
      );
    }

    return tracking;
  }

  async confirmDelivery(orderId: string, photoProof?: string) {
    const tracking = await this.prisma.deliveryTracking.update({
      where: { orderId },
      data: { 
        status: 'DELIVERED', 
        photoProof,
        deliveredAt: new Date()
      },
      include: { order: { include: { user: true } } }
    });

    // Send confirmation SMS
    if (tracking.order.user.phone) {
      await this.smsService.sendDeliveryConfirmation(
        tracking.order.user.phone,
        tracking.order.orderNumber
      );
    }

    return tracking;
  }

  async getTracking(orderId: string) {
    const tracking = await this.prisma.deliveryTracking.findUnique({
      where: { orderId },
      include: { updates: { orderBy: { timestamp: 'desc' } } }
    });

    if (!tracking) {
      throw new NotFoundException('Tracking information not found');
    }

    return tracking;
  }

  async handleFailedDelivery(orderId: string, reason: string) {
    return this.updateStatus(orderId, 'DELIVERY_FAILED', undefined, reason);
  }
}