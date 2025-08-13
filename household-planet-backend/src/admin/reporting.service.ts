import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportingService {
  constructor(private prisma: PrismaService) {}

  async generateSalesReport(startDate: Date, endDate: Date) {
    const [salesData, topProducts, salesByLocation] = await Promise.all([
      this.getSalesData(startDate, endDate),
      this.getTopProducts(startDate, endDate),
      this.getSalesByLocation(startDate, endDate)
    ]);

    return {
      period: { startDate, endDate },
      summary: salesData,
      topProducts,
      salesByLocation,
      generatedAt: new Date()
    };
  }

  async generateCustomerReport() {
    const [customerStats, topCustomers, customerGrowth, retention] = await Promise.all([
      this.getCustomerStats(),
      this.getTopCustomers(),
      this.getCustomerGrowth(),
      this.getCustomerRetention()
    ]);

    return {
      customerStats,
      topCustomers,
      customerGrowth,
      retention,
      generatedAt: new Date()
    };
  }

  async generateInventoryReport() {
    const [stockLevels, lowStock, topSelling, slowMoving] = await Promise.all([
      this.getStockLevels(),
      this.getLowStockItems(),
      this.getTopSellingProducts(),
      this.getSlowMovingProducts()
    ]);

    return {
      stockLevels,
      lowStock,
      topSelling,
      slowMoving,
      generatedAt: new Date()
    };
  }

  async generateFinancialReport(startDate: Date, endDate: Date) {
    const [revenue, expenses, profit, paymentMethods] = await Promise.all([
      this.getRevenue(startDate, endDate),
      this.getExpenses(startDate, endDate),
      this.getProfit(startDate, endDate),
      this.getPaymentMethodBreakdown(startDate, endDate)
    ]);

    return {
      period: { startDate, endDate },
      revenue,
      expenses,
      profit,
      paymentMethods,
      generatedAt: new Date()
    };
  }

  private async getSalesData(startDate: Date, endDate: Date) {
    return this.prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      _avg: { total: true },
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { not: 'CANCELLED' }
      }
    });
  }

  private async getTopProducts(startDate: Date, endDate: Date) {
    return this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, total: true },
      where: {
        order: {
          createdAt: { gte: startDate, lte: endDate },
          status: { not: 'CANCELLED' }
        }
      },
      orderBy: { _sum: { total: 'desc' } },
      take: 10
    });
  }

  private async getSalesByLocation(startDate: Date, endDate: Date) {
    return this.prisma.order.groupBy({
      by: ['deliveryLocation'],
      _sum: { total: true },
      _count: true,
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { not: 'CANCELLED' }
      },
      orderBy: { _sum: { total: 'desc' } }
    });
  }

  private async getCustomerStats() {
    const [total, active, new30Days] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } }),
      this.prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    return { total, active, new30Days };
  }

  private async getTopCustomers() {
    return this.prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      orderBy: { totalSpent: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        totalSpent: true,
        _count: { select: { orders: true } }
      }
    });
  }

  private async getCustomerGrowth() {
    return this.prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_customers
      FROM users 
      WHERE role = 'CUSTOMER' 
        AND created_at >= DATE('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
  }

  private async getCustomerRetention() {
    const [totalCustomers, returningCustomers] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({
        where: {
          role: 'CUSTOMER',
          orders: { some: { createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } } }
        }
      })
    ]);

    return {
      total: totalCustomers,
      returning: returningCustomers,
      rate: totalCustomers > 0 ? (returningCustomers / totalCustomers * 100) : 0
    };
  }

  private async getStockLevels() {
    return this.prisma.product.aggregate({
      _sum: { stock: true },
      _count: true,
      where: { isActive: true }
    });
  }

  private async getLowStockItems() {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: this.prisma.product.fields.lowStockThreshold }
      },
      select: {
        id: true,
        name: true,
        stock: true,
        lowStockThreshold: true
      }
    });
  }

  private async getTopSellingProducts() {
    return this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    });
  }

  private async getSlowMovingProducts() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        orderItems: {
          none: {
            order: { createdAt: { gte: thirtyDaysAgo } }
          }
        }
      },
      select: {
        id: true,
        name: true,
        stock: true,
        createdAt: true
      },
      take: 10
    });
  }

  private async getRevenue(startDate: Date, endDate: Date) {
    return this.prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { not: 'CANCELLED' }
      }
    });
  }

  private async getExpenses(startDate: Date, endDate: Date) {
    // Simplified expense calculation
    const orders = await this.prisma.order.aggregate({
      _sum: { shippingCost: true },
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { not: 'CANCELLED' }
      }
    });

    return { shipping: orders._sum.shippingCost || 0 };
  }

  private async getProfit(startDate: Date, endDate: Date) {
    const [revenue, expenses] = await Promise.all([
      this.getRevenue(startDate, endDate),
      this.getExpenses(startDate, endDate)
    ]);

    const totalRevenue = revenue._sum.total || 0;
    const totalExpenses = expenses.shipping || 0;
    
    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: totalRevenue - totalExpenses,
      margin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100) : 0
    };
  }

  private async getPaymentMethodBreakdown(startDate: Date, endDate: Date) {
    return this.prisma.payment.groupBy({
      by: ['paymentMethod'],
      _sum: { amount: true },
      _count: true,
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'COMPLETED'
      }
    });
  }
}