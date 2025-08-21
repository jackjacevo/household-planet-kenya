import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryStatus, DeliveryTimeSlot, ScheduleDeliveryDto, UpdateDeliveryStatusDto, DeliveryFeedbackDto } from './dto/delivery.dto';

@Injectable()
export class DeliveryTrackingService {
  constructor(private prisma: PrismaService) {}

  async scheduleDelivery(dto: ScheduleDeliveryDto) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber: dto.orderId }
    });

    if (!order) throw new Error('Order not found');

    // Create delivery record
    const delivery = await this.prisma.delivery.create({
      data: {
        orderId: order.id,
        status: DeliveryStatus.CONFIRMED,
        scheduledDate: new Date(dto.preferredDate),
        timeSlot: dto.timeSlot,
        specialInstructions: dto.specialInstructions,
        trackingNumber: `DL-${Date.now()}`,
      }
    });

    return delivery;
  }

  async updateDeliveryStatus(trackingNumber: string, dto: UpdateDeliveryStatusDto) {
    const delivery = await this.prisma.delivery.update({
      where: { trackingNumber },
      data: {
        status: dto.status,
        notes: dto.notes,
        photoProof: dto.photoProof,
        failureReason: dto.failureReason,
        updatedAt: new Date(),
      }
    });

    // Create status history
    await this.prisma.deliveryStatusHistory.create({
      data: {
        deliveryId: delivery.id,
        status: dto.status,
        notes: dto.notes,
        timestamp: new Date(),
      }
    });

    return delivery;
  }

  async getDeliveryTracking(trackingNumber: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { trackingNumber },
      include: {
        order: {
          select: {
            orderNumber: true,
            total: true,
            deliveryLocation: true,
          }
        },
        statusHistory: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!delivery) throw new Error('Delivery not found');

    return {
      ...delivery,
      estimatedDelivery: this.calculateEstimatedDelivery(delivery.scheduledDate, delivery.order.deliveryLocation),
    };
  }

  async submitFeedback(trackingNumber: string, dto: DeliveryFeedbackDto) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { trackingNumber }
    });

    if (!delivery) throw new Error('Delivery not found');

    return this.prisma.deliveryFeedback.create({
      data: {
        deliveryId: delivery.id,
        rating: dto.rating,
        comment: dto.comment,
      }
    });
  }

  async rescheduleDelivery(trackingNumber: string, newDate: string, timeSlot: DeliveryTimeSlot) {
    return this.prisma.delivery.update({
      where: { trackingNumber },
      data: {
        status: DeliveryStatus.RESCHEDULED,
        scheduledDate: new Date(newDate),
        timeSlot,
        rescheduleCount: { increment: 1 },
      }
    });
  }

  private calculateEstimatedDelivery(scheduledDate: Date, location?: string): Date {
    const baseDate = new Date(scheduledDate);
    // Add 1-2 days based on location tier
    const additionalDays = location?.includes('CBD') ? 1 : 2;
    baseDate.setDate(baseDate.getDate() + additionalDays);
    return baseDate;
  }

  async getDeliveryAnalytics() {
    const [totalDeliveries, successfulDeliveries, failedDeliveries, avgRating] = await Promise.all([
      this.prisma.delivery.count(),
      this.prisma.delivery.count({ where: { status: DeliveryStatus.DELIVERED } }),
      this.prisma.delivery.count({ where: { status: DeliveryStatus.FAILED } }),
      this.prisma.deliveryFeedback.aggregate({ _avg: { rating: true } })
    ]);

    return {
      totalDeliveries,
      successfulDeliveries,
      failedDeliveries,
      successRate: totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0,
      avgRating: avgRating._avg.rating || 0,
    };
  }
}