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
    // First try to find by tracking number
    let delivery = await this.prisma.delivery.findUnique({
      where: { trackingNumber },
      include: {
        order: {
          select: {
            orderNumber: true,
            total: true,
            deliveryLocation: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        },
        statusHistory: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    // If not found, try to find order by order number and create mock delivery data
    if (!delivery) {
      const order = await this.prisma.order.findUnique({
        where: { orderNumber: trackingNumber },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          deliveryLocation: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          trackingNumber: true
        }
      });

      if (!order) throw new Error('Order not found');

      // Create mock delivery tracking data based on order status
      const mockStatusHistory = this.generateMockStatusHistory(order);
      
      return {
        trackingNumber: order.trackingNumber || `TRK-${order.orderNumber}`,
        status: this.mapOrderStatusToDeliveryStatus(order.status),
        scheduledDate: new Date(order.createdAt.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from order
        timeSlot: 'MORNING',
        order: {
          orderNumber: order.orderNumber,
          total: order.total,
          deliveryLocation: order.deliveryLocation || 'Not specified'
        },
        statusHistory: mockStatusHistory
      };
    }

    return {
      ...delivery,
      estimatedDelivery: this.calculateEstimatedDelivery(delivery.scheduledDate, delivery.order.deliveryLocation),
    };
  }

  private generateMockStatusHistory(order: any) {
    const history = [];
    const baseTime = new Date(order.createdAt);
    
    // Order confirmed
    history.push({
      status: 'CONFIRMED',
      notes: 'Order confirmed and being prepared',
      timestamp: baseTime
    });

    if (['PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
      history.push({
        status: 'PROCESSING',
        notes: 'Order is being processed',
        timestamp: new Date(baseTime.getTime() + 2 * 60 * 60 * 1000) // 2 hours later
      });
    }

    if (['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
      history.push({
        status: 'IN_TRANSIT',
        notes: 'Order is in transit',
        timestamp: new Date(baseTime.getTime() + 24 * 60 * 60 * 1000) // 1 day later
      });
    }

    if (['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)) {
      history.push({
        status: 'OUT_FOR_DELIVERY',
        notes: 'Order is out for delivery',
        timestamp: new Date(baseTime.getTime() + 48 * 60 * 60 * 1000) // 2 days later
      });
    }

    if (order.status === 'DELIVERED') {
      history.push({
        status: 'DELIVERED',
        notes: 'Order delivered successfully',
        timestamp: order.updatedAt
      });
    }

    return history;
  }

  private mapOrderStatusToDeliveryStatus(orderStatus: string): string {
    const statusMap = {
      'PENDING': 'CONFIRMED',
      'CONFIRMED': 'CONFIRMED', 
      'PROCESSING': 'PROCESSING',
      'SHIPPED': 'IN_TRANSIT',
      'IN_TRANSIT': 'IN_TRANSIT',
      'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
      'DELIVERED': 'DELIVERED',
      'CANCELLED': 'FAILED'
    };
    return statusMap[orderStatus] || 'CONFIRMED';
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

  async getAdminDeliveries() {
    const orders = await this.prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        },
        delivery: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return orders.map(order => {
      let formattedAddress = order.deliveryLocation || 'N/A';
      
      if (!formattedAddress || formattedAddress === 'N/A') {
        if (order.shippingAddress) {
          try {
            const parsed = JSON.parse(order.shippingAddress);
            const parts = [parsed.street, parsed.town, parsed.county].filter(Boolean);
            formattedAddress = parts.length > 0 ? parts.join(', ') : order.shippingAddress;
          } catch {
            formattedAddress = order.shippingAddress;
          }
        }
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.user?.name || 'Unknown',
        customerPhone: order.user?.phone || 'N/A',
        shippingAddress: formattedAddress,
        status: order.status,
        estimatedDelivery: order.delivery?.scheduledDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        trackingNumber: order.trackingNumber || order.delivery?.trackingNumber || null,
        total: order.total || 0,
        createdAt: order.createdAt
      };
    });
  }
}