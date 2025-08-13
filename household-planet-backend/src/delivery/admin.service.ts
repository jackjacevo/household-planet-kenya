import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminDeliveryService {
  constructor(private prisma: PrismaService) {}

  async getDeliveryDashboard() {
    const [totalOrders, pendingDeliveries, completedDeliveries, failedDeliveries] = await Promise.all([
      this.prisma.deliveryTracking.count(),
      this.prisma.deliveryTracking.count({ where: { status: { in: ['PENDING', 'OUT_FOR_DELIVERY'] } } }),
      this.prisma.deliveryTracking.count({ where: { status: 'DELIVERED' } }),
      this.prisma.deliveryTracking.count({ where: { status: 'DELIVERY_FAILED' } })
    ]);

    return {
      totalOrders,
      pendingDeliveries,
      completedDeliveries,
      failedDeliveries,
      deliveryRate: totalOrders > 0 ? (completedDeliveries / totalOrders * 100).toFixed(2) : 0
    };
  }

  async getDeliveryAnalytics(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const deliveriesByLocation = await this.prisma.order.groupBy({
      by: ['deliveryLocation'],
      _count: { deliveryLocation: true },
      where: { createdAt: { gte: startDate } },
      orderBy: { _count: { deliveryLocation: 'desc' } }
    });

    const deliveriesByStatus = await this.prisma.deliveryTracking.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { createdAt: { gte: startDate } }
    });

    const avgRating = await this.prisma.deliveryFeedback.aggregate({
      _avg: { rating: true },
      where: { createdAt: { gte: startDate } }
    });

    return {
      deliveriesByLocation: deliveriesByLocation.map(d => ({
        location: d.deliveryLocation,
        count: d._count.deliveryLocation
      })),
      deliveriesByStatus: deliveriesByStatus.map(d => ({
        status: d.status,
        count: d._count.status
      })),
      averageRating: avgRating._avg.rating || 0
    };
  }

  async getFailedDeliveries() {
    return this.prisma.deliveryTracking.findMany({
      where: { status: 'DELIVERY_FAILED' },
      include: {
        order: {
          include: { user: true }
        },
        updates: { orderBy: { timestamp: 'desc' }, take: 1 }
      }
    });
  }

  async bulkUpdateStatus(orderIds: string[], status: string, notes?: string) {
    const results = [];
    for (const orderId of orderIds) {
      const updated = await this.prisma.deliveryTracking.update({
        where: { orderId },
        data: { status, notes }
      });
      results.push(updated);
    }
    return results;
  }
}