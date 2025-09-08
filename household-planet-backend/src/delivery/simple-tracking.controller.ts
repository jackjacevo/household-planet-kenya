import { Controller, Get, Param, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
@Controller('simple-delivery')
export class SimpleTrackingController {
  constructor(private prisma: PrismaService) {}

  @Get('track/:trackingNumber')
  async trackDelivery(@Param('trackingNumber') trackingNumber: string) {
    console.log('Tracking request for:', trackingNumber);
    
    try {
      // Debug: Check what orders exist
      const allOrders = await this.prisma.order.findMany({
        select: {
          id: true,
          orderNumber: true,
          trackingNumber: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      console.log('Recent orders in DB:', allOrders);

      // Find order by tracking number
      const order = await this.prisma.order.findFirst({
        where: {
          OR: [
            { trackingNumber: trackingNumber },
            { orderNumber: trackingNumber }
          ]
        },
        include: {
          user: true
        }
      });

      console.log('Found order:', order ? 'Yes' : 'No');
      if (order) {
        console.log('Order details:', { id: order.id, orderNumber: order.orderNumber, trackingNumber: order.trackingNumber, status: order.status });
      }

      if (!order) {
        return { success: false, message: 'Order not found' };
      }

      // Create status history based on order status and timestamps
      const statusHistory = [
        {
          status: 'CONFIRMED',
          notes: 'Order confirmed and being prepared',
          timestamp: order.createdAt
        }
      ];

      if (order.status !== 'PENDING') {
        statusHistory.push({
          status: order.status,
          notes: this.getStatusNotes(order.status),
          timestamp: order.updatedAt
        });
      }

      const trackingData = {
        trackingNumber: order.trackingNumber || order.orderNumber,
        status: order.status,
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        timeSlot: 'MORNING',
        order: {
          orderNumber: order.orderNumber,
          total: order.total,
          deliveryLocation: order.deliveryLocation || 'Custom Location'
        },
        statusHistory
      };
      
      return { success: true, data: trackingData };
    } catch (error) {
      console.error('Tracking error:', error);
      return { success: false, message: 'Error fetching tracking information' };
    }
  }

  private getStatusNotes(status: string): string {
    const statusNotes = {
      'PENDING': 'Order is pending confirmation',
      'CONFIRMED': 'Order confirmed and being prepared',
      'PROCESSING': 'Order is being processed',
      'SHIPPED': 'Order has been shipped',
      'DELIVERED': 'Order has been delivered',
      'CANCELLED': 'Order has been cancelled'
    };
    return statusNotes[status] || 'Status updated';
  }
}