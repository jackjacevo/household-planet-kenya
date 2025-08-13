import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSalesAnalytics(period: string) {
    const days = this.parsePeriod(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [dailySales, weeklySales, monthlySales, topProducts] = await Promise.all([
      this.getDailySales(startDate),
      this.getWeeklySales(startDate),
      this.getMonthlySales(),
      this.getTopSellingProducts(startDate)
    ]);

    return {
      dailySales,
      weeklySales,
      monthlySales,
      topProducts
    };
  }

  private parsePeriod(period: string): number {
    const periodMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    return periodMap[period] || 30;
  }

  private async getDailySales(startDate: Date) {
    const sales = await this.prisma.order.groupBy({
      by: ['createdAt'],
      _sum: { total: true },
      _count: true,
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' }
      }
    });

    return sales.map(sale => ({
      date: sale.createdAt.toISOString().split('T')[0],
      revenue: sale._sum.total || 0,
      orders: sale._count
    }));
  }

  private async getWeeklySales(startDate: Date) {
    const sales = await this.prisma.$queryRaw`
      SELECT 
        strftime('%Y-%W', createdAt) as week,
        SUM(total) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE createdAt >= ${startDate} AND status != 'CANCELLED'
      GROUP BY strftime('%Y-%W', createdAt)
      ORDER BY week
    `;
    return sales;
  }

  private async getMonthlySales() {
    const sales = await this.prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        SUM(total) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE status != 'CANCELLED'
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month DESC
      LIMIT 12
    `;
    return sales;
  }

  private async getTopSellingProducts(startDate: Date) {
    return this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, total: true },
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        }
      },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    });
  }

  async getCustomerAnalytics() {
    const [newCustomers, customerRetention, topCustomers, customersByLocation] = await Promise.all([
      this.getNewCustomersOverTime(),
      this.getCustomerRetentionRate(),
      this.getTopCustomers(),
      this.getCustomersByLocation()
    ]);

    return {
      newCustomers,
      retentionRate: customerRetention,
      topCustomers,
      customersByLocation
    };
  }

  private async getNewCustomersOverTime() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        role: 'CUSTOMER',
        createdAt: { gte: thirtyDaysAgo }
      }
    });
  }

  private async getCustomerRetentionRate() {
    const [totalCustomers, returningCustomers] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({
        where: {
          role: 'CUSTOMER',
          orders: { some: { createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } } }
        }
      })
    ]);

    return totalCustomers > 0 ? (returningCustomers / totalCustomers * 100) : 0;
  }

  private async getTopCustomers() {
    return this.prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        totalSpent: true,
        loyaltyPoints: true,
        _count: { select: { orders: true } }
      },
      orderBy: { totalSpent: 'desc' },
      take: 10
    });
  }

  private async getCustomersByLocation() {
    return this.prisma.address.groupBy({
      by: ['county'],
      _count: { county: true },
      orderBy: { _count: { county: 'desc' } },
      take: 10
    });
  }

  async getProductAnalytics() {
    const [mostViewed, bestRated, categoryPerformance, inventoryStatus] = await Promise.all([
      this.getMostViewedProducts(),
      this.getBestRatedProducts(),
      this.getCategoryPerformance(),
      this.getInventoryStatus()
    ]);

    return {
      mostViewed,
      bestRated,
      categoryPerformance,
      inventoryStatus
    };
  }

  private async getMostViewedProducts() {
    return this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        viewCount: true,
        price: true
      },
      orderBy: { viewCount: 'desc' },
      take: 10
    });
  }

  private async getBestRatedProducts() {
    return this.prisma.product.findMany({
      where: { totalReviews: { gt: 0 } },
      select: {
        id: true,
        name: true,
        averageRating: true,
        totalReviews: true,
        price: true
      },
      orderBy: { averageRating: 'desc' },
      take: 10
    });
  }

  private async getCategoryPerformance() {
    return this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { products: true } },
        products: {
          select: { viewCount: true },
          where: { isActive: true }
        }
      },
      where: { isActive: true }
    });
  }

  private async getInventoryStatus() {
    const [totalProducts, lowStock, outOfStock, inStock] = await Promise.all([
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({
        where: {
          isActive: true,
          stock: { lte: this.prisma.product.fields.lowStockThreshold, gt: 0 }
        }
      }),
      this.prisma.product.count({
        where: { isActive: true, stock: 0 }
      }),
      this.prisma.product.count({
        where: {
          isActive: true,
          stock: { gt: this.prisma.product.fields.lowStockThreshold }
        }
      })
    ]);

    return {
      total: totalProducts,
      lowStock,
      outOfStock,
      inStock
    };
  }

  async getGeographicAnalytics() {
    const [salesByCounty, deliveryPerformance, popularLocations] = await Promise.all([
      this.getSalesByCounty(),
      this.getDeliveryPerformanceByLocation(),
      this.getPopularDeliveryLocations()
    ]);

    return {
      salesByCounty,
      deliveryPerformance,
      popularLocations
    };
  }

  private async getSalesByCounty() {
    return this.prisma.$queryRaw`
      SELECT 
        a.county,
        COUNT(o.id) as orderCount,
        SUM(o.total) as totalRevenue,
        AVG(o.total) as avgOrderValue
      FROM orders o
      JOIN addresses a ON o.shippingAddress LIKE '%' || a.county || '%'
      WHERE o.status != 'CANCELLED'
      GROUP BY a.county
      ORDER BY totalRevenue DESC
      LIMIT 20
    `;
  }

  private async getDeliveryPerformanceByLocation() {
    return this.prisma.order.groupBy({
      by: ['deliveryLocation'],
      _count: { deliveryLocation: true },
      _avg: { deliveryPrice: true },
      where: { status: { not: 'CANCELLED' } },
      orderBy: { _count: { deliveryLocation: 'desc' } }
    });
  }

  private async getPopularDeliveryLocations() {
    return this.prisma.deliveryLocation.findMany({
      select: {
        id: true,
        name: true,
        tier: true,
        price: true
      },
      orderBy: { name: 'asc' }
    });
  }

  async getKPIs() {
    const [revenue, orders, customers, conversion, retention, avgOrder] = await Promise.all([
      this.getRevenueKPI(),
      this.getOrdersKPI(),
      this.getCustomersKPI(),
      this.getConversionKPI(),
      this.getRetentionKPI(),
      this.getAverageOrderKPI()
    ]);

    return {
      revenue,
      orders,
      customers,
      conversion,
      retention,
      avgOrder
    };
  }

  private async getRevenueKPI() {
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const thisMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    const [current, previous] = await Promise.all([
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: thisMonth },
          status: { not: 'CANCELLED' }
        }
      }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: lastMonth, lt: thisMonth },
          status: { not: 'CANCELLED' }
        }
      })
    ]);

    const currentValue = current._sum.total || 0;
    const previousValue = previous._sum.total || 0;
    const change = previousValue > 0 ? ((currentValue - previousValue) / previousValue * 100) : 0;

    return { current: currentValue, change };
  }

  private async getOrdersKPI() {
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const thisMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    const [current, previous] = await Promise.all([
      this.prisma.order.count({
        where: {
          createdAt: { gte: thisMonth },
          status: { not: 'CANCELLED' }
        }
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: lastMonth, lt: thisMonth },
          status: { not: 'CANCELLED' }
        }
      })
    ]);

    const change = previous > 0 ? ((current - previous) / previous * 100) : 0;
    return { current, change };
  }

  private async getCustomersKPI() {
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const thisMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    const [current, previous] = await Promise.all([
      this.prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: thisMonth }
        }
      }),
      this.prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: lastMonth, lt: thisMonth }
        }
      })
    ]);

    const change = previous > 0 ? ((current - previous) / previous * 100) : 0;
    return { current, change };
  }

  private async getConversionKPI() {
    const [totalVisitors, customers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          role: 'CUSTOMER',
          orders: { some: { status: { not: 'CANCELLED' } } }
        }
      })
    ]);

    const current = totalVisitors > 0 ? (customers / totalVisitors * 100) : 0;
    return { current, change: 0 }; // Would need historical data for change
  }

  private async getRetentionKPI() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [totalCustomers, activeCustomers] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({
        where: {
          role: 'CUSTOMER',
          orders: { some: { createdAt: { gte: thirtyDaysAgo } } }
        }
      })
    ]);

    const current = totalCustomers > 0 ? (activeCustomers / totalCustomers * 100) : 0;
    return { current, change: 0 }; // Would need historical data for change
  }

  private async getAverageOrderKPI() {
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const thisMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    const [current, previous] = await Promise.all([
      this.prisma.order.aggregate({
        _avg: { total: true },
        where: {
          createdAt: { gte: thisMonth },
          status: { not: 'CANCELLED' }
        }
      }),
      this.prisma.order.aggregate({
        _avg: { total: true },
        where: {
          createdAt: { gte: lastMonth, lt: thisMonth },
          status: { not: 'CANCELLED' }
        }
      })
    ]);

    const currentValue = current._avg.total || 0;
    const previousValue = previous._avg.total || 0;
    const change = previousValue > 0 ? ((currentValue - previousValue) / previousValue * 100) : 0;

    return { current: currentValue, change };
  }
}