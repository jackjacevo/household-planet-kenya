import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getPaymentAnalytics(startDate: Date, endDate: Date) {
    const [totalRevenue, paymentsByMethod, dailyRevenue, failureRate] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { 
          status: 'COMPLETED',
          createdAt: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      this.prisma.payment.groupBy({
        by: ['paymentMethod'],
        where: { 
          status: 'COMPLETED',
          createdAt: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      this.prisma.$queryRaw`
        SELECT DATE(createdAt) as date, SUM(amount) as revenue, COUNT(*) as transactions
        FROM payments 
        WHERE status = 'COMPLETED' AND createdAt BETWEEN ${startDate} AND ${endDate}
        GROUP BY DATE(createdAt)
        ORDER BY date
      `,
      this.prisma.payment.count({
        where: { 
          createdAt: { gte: startDate, lte: endDate },
          status: 'FAILED'
        }
      })
    ]);

    const avgTransactionValue = totalRevenue._sum.amount / totalRevenue._count.id || 0;
    const failurePercentage = (failureRate / totalRevenue._count.id) * 100 || 0;

    return {
      summary: {
        totalRevenue: totalRevenue._sum.amount || 0,
        totalTransactions: totalRevenue._count.id,
        avgTransactionValue,
        failureRate: failurePercentage
      },
      paymentsByMethod,
      dailyRevenue,
      period: { startDate, endDate }
    };
  }

  async getTopCustomers(limit = 10) {
    return this.prisma.payment.groupBy({
      by: ['orderId'],
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: limit
    });
  }

  async getRefundAnalytics() {
    const [totalRefunds, refundsByReason] = await Promise.all([
      this.prisma.refund.aggregate({
        _sum: { amount: true },
        _count: { id: true }
      }),
      this.prisma.refund.groupBy({
        by: ['reason'],
        _sum: { amount: true },
        _count: { id: true }
      })
    ]);

    return { totalRefunds, refundsByReason };
  }
}