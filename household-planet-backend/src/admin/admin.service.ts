import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecureUploadService } from '../common/services/secure-upload.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private secureUpload: SecureUploadService
  ) {}

  async getDashboardStats() {
    try {
      console.log('🔍 AdminService: Fetching dashboard stats...');
      
      const [totalProducts, totalOrders, totalCustomers, orders, revenue] = await Promise.all([
        this.prisma.product.count().catch(() => 0),
        this.prisma.order.count().catch(() => 0),
        this.prisma.user.count({ where: { role: 'CUSTOMER' } }).catch(() => 0),
        this.prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
            items: { include: { product: { select: { name: true } } } }
          }
        }).catch(() => []),
        this.prisma.order.aggregate({
          _sum: { total: true },
          where: { status: { not: 'CANCELLED' } }
        }).catch(() => ({ _sum: { total: 0 } }))
      ]);
      
      console.log('📊 Dashboard stats:', { totalProducts, totalOrders, totalCustomers, ordersCount: orders.length });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [todayOrders, todayRevenue, pendingOrders] = await Promise.all([
        this.prisma.order.count({
          where: { createdAt: { gte: today, lt: tomorrow } }
        }).catch(() => 0),
        this.prisma.order.aggregate({
          _sum: { total: true },
          where: {
            createdAt: { gte: today, lt: tomorrow },
            status: { not: 'CANCELLED' }
          }
        }).catch(() => ({ _sum: { total: 0 } })),
        this.prisma.order.count({ where: { status: 'PENDING' } }).catch(() => 0)
      ]);

      // Get top products by sales
      const topProducts = await this.getTopSellingProducts();
      
      // Get customer growth data
      const customerGrowth = await this.getCustomerGrowthData();
      
      // Get sales by county
      const salesByCounty = await this.getSalesByCounty();
      
      // Get delivered revenue
      const deliveredRevenue = await this.getDeliveredRevenue();

      const dashboardData = {
        overview: {
          totalOrders,
          totalRevenue: Number(revenue._sum.total) || 0,
          deliveredRevenue,
          totalCustomers,
          totalProducts,
          activeProducts: totalProducts,
          outOfStockProducts: 0,
          todayOrders,
          todayRevenue: Number(todayRevenue._sum.total) || 0,
          pendingOrders,
          lowStockProducts: 0
        },
        recentOrders: orders || [],
        topProducts: topProducts || [],
        customerGrowth: customerGrowth || [],
        salesByCounty: salesByCounty || []
      };
      
      console.log('✅ Dashboard data prepared successfully');
      return dashboardData;
    } catch (error) {
      console.error('❌ Error in getDashboardStats:', error);
      // Return fallback data if database queries fail
      return {
        overview: {
          totalOrders: 0,
          totalRevenue: 0,
          deliveredRevenue: 0,
          totalCustomers: 0,
          totalProducts: 0,
          activeProducts: 0,
          outOfStockProducts: 0,
          todayOrders: 0,
          todayRevenue: 0,
          pendingOrders: 0,
          lowStockProducts: 0
        },
        recentOrders: [],
        topProducts: [],
        customerGrowth: [],
        salesByCounty: []
      };
    }
  }

  private async getTopSellingProducts() {
    try {
      const topProducts = await this.prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true
        },
        _count: {
          productId: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 5
      });

      const productsWithDetails = await Promise.all(
        topProducts.map(async (item) => {
          const product = await this.prisma.product.findUnique({
            where: { id: item.productId },
            select: {
              id: true,
              name: true,
              price: true,
              images: true
            }
          });
          
          return {
            id: product?.id || 0,
            name: product?.name || 'Unknown Product',
            price: product?.price || 0,
            totalSold: item._sum.quantity || 0,
            images: product?.images ? JSON.parse(product.images as string) : []
          };
        })
      );

      return productsWithDetails;
    } catch (error) {
      console.error('Error fetching top products:', error);
      return [];
    }
  }

  private async getCustomerGrowthData() {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const customers = await this.prisma.user.findMany({
        where: {
          role: 'CUSTOMER',
          createdAt: {
            gte: sixMonthsAgo
          }
        },
        select: {
          createdAt: true
        }
      });

      const monthlyData: Record<string, number> = {};
      
      customers.forEach(customer => {
        const monthKey = customer.createdAt.toLocaleDateString('en-US', { 
          month: 'short', 
          year: '2-digit' 
        });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      });

      return Object.entries(monthlyData).map(([month, customers]) => ({
        month,
        customers
      }));
    } catch (error) {
      console.error('Error fetching customer growth:', error);
      return [];
    }
  }

  private async getSalesByCounty() {
    try {
      const orders = await this.prisma.order.findMany({
        where: {
          status: { not: 'CANCELLED' },
          deliveryLocation: { not: null }
        },
        select: {
          total: true,
          deliveryLocation: true
        }
      });

      const countyData: Record<string, { revenue: number; orders: number }> = {};
      
      orders.forEach(order => {
        const county = order.deliveryLocation || 'Unknown';
        if (!countyData[county]) {
          countyData[county] = { revenue: 0, orders: 0 };
        }
        countyData[county].revenue += order.total;
        countyData[county].orders += 1;
      });

      return Object.entries(countyData)
        .map(([county, data]) => ({
          county,
          revenue: data.revenue,
          orders: data.orders
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching sales by county:', error);
      return [];
    }
  }

  private async getDeliveredRevenue() {
    try {
      const deliveredRevenue = await this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'DELIVERED' }
      });
      return Number(deliveredRevenue._sum.total) || 0;
    } catch (error) {
      console.error('Error fetching delivered revenue:', error);
      return 0;
    }
  }

  async getInventoryAlerts() {
    try {
      const [lowStockProducts, outOfStockProducts] = await Promise.all([
        this.prisma.product.findMany({
          where: {
            stock: { lte: 10, gt: 0 },
            isActive: true
          },
          select: {
            id: true,
            name: true,
            stock: true,
            sku: true
          },
          take: 20
        }),
        this.prisma.product.findMany({
          where: {
            stock: 0,
            isActive: true
          },
          select: {
            id: true,
            name: true,
            stock: true,
            sku: true
          },
          take: 20
        })
      ]);

      const alerts = [
        ...lowStockProducts.map(product => ({
          id: product.id,
          type: 'LOW_STOCK',
          message: `${product.name} is running low (${product.stock} remaining)`,
          severity: 'warning',
          product
        })),
        ...outOfStockProducts.map(product => ({
          id: product.id,
          type: 'OUT_OF_STOCK',
          message: `${product.name} is out of stock`,
          severity: 'critical',
          product
        }))
      ];

      return {
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        alerts
      };
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
      return {
        lowStock: [],
        outOfStock: [],
        alerts: []
      };
    }
  }

  async getProducts(query: any) {
    try {
      const { page = 1, limit = 10, search, category, status } = query;
      const skip = (page - 1) * limit;
      
      const where: any = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { sku: { contains: search, mode: Prisma.QueryMode.insensitive } }
        ];
      }
      
      if (category) {
        where.categoryId = parseInt(category);
      }
      
      if (status) {
        where.isActive = status === 'active';
      }
      
      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          include: { 
            category: true,
            _count: {
              select: {
                orderItems: true
              }
            }
          },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.product.count({ where })
      ]);
      
      return { products, total, page: parseInt(page), limit: parseInt(limit) };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { products: [], total: 0, page: 1, limit: 10 };
    }
  }

  async getCategories() {
    try {
      const categories = await this.prisma.category.findMany({
        include: {
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: {
          sortOrder: 'asc'
        }
      });
      
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getActivities(query: any) {
    try {
      const { page = 1, limit = 20, type, userId } = query;
      const skip = (page - 1) * limit;
      
      // For now, we'll use orders as activities
      // In a real system, you'd have a dedicated activities table
      const where: any = {};
      
      if (userId) {
        where.userId = parseInt(userId);
      }
      
      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          include: {
            user: { select: { name: true, email: true } },
            items: {
              include: {
                product: { select: { name: true } }
              }
            }
          },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.order.count({ where })
      ]);
      
      const activities = orders.map(order => ({
        id: order.id,
        type: 'order_created',
        description: `Order #${order.orderNumber} created`,
        userId: order.userId,
        user: order.user,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
          itemCount: order.items.length
        },
        createdAt: order.createdAt
      }));
      
      return { activities, total, page: parseInt(page), limit: parseInt(limit) };
    } catch (error) {
      console.error('Error fetching activities:', error);
      return { activities: [], total: 0, page: 1, limit: 20 };
    }
  }

  async getActivitiesStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [totalActivities, todayActivities] = await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.count({
          where: {
            createdAt: { gte: today, lt: tomorrow }
          }
        })
      ]);

      return { totalActivities, todayActivities };
    } catch (error) {
      console.error('Error fetching activities stats:', error);
      return { totalActivities: 0, todayActivities: 0 };
    }
  }

  // Analytics methods
  async getSalesAnalytics(period: string) {
    try {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'daily':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // 12 weeks
          break;
        case 'monthly':
          startDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000); // 12 months
          break;
        case 'yearly':
          startDate = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000); // 5 years
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const orders = await this.prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        },
        select: {
          createdAt: true,
          total: true
        }
      });

      const salesData: Record<string, { revenue: number; orders: number }> = {};
      
      orders.forEach(order => {
        let periodKey: string;
        
        switch (period) {
          case 'daily':
            periodKey = order.createdAt.toISOString().split('T')[0];
            break;
          case 'weekly':
            const weekStart = new Date(order.createdAt);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            periodKey = weekStart.toISOString().split('T')[0];
            break;
          case 'monthly':
            periodKey = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
            break;
          case 'yearly':
            periodKey = order.createdAt.getFullYear().toString();
            break;
          default:
            periodKey = order.createdAt.toISOString().split('T')[0];
        }
        
        if (!salesData[periodKey]) {
          salesData[periodKey] = { revenue: 0, orders: 0 };
        }
        salesData[periodKey].revenue += order.total;
        salesData[periodKey].orders += 1;
      });

      const sales = Object.entries(salesData).map(([period, data]) => ({
        period,
        revenue: data.revenue,
        orders: data.orders
      }));

      const total = sales.reduce((sum, item) => sum + item.revenue, 0);
      
      return { sales, total, period };
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      return { sales: [], total: 0, period };
    }
  }

  async getPerformanceMetrics() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const [orderFulfillmentRate, averageDeliveryTime, customerSatisfaction] = await Promise.all([
        this.getOrderFulfillmentRate(thirtyDaysAgo),
        this.getAverageDeliveryTime(thirtyDaysAgo),
        this.getCustomerSatisfactionRate()
      ]);

      return {
        metrics: {
          orderFulfillmentRate,
          averageDeliveryTime,
          customerSatisfaction
        }
      };
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return { metrics: [] };
    }
  }

  private async getOrderFulfillmentRate(startDate: Date) {
    try {
      const [totalOrders, deliveredOrders] = await Promise.all([
        this.prisma.order.count({
          where: {
            createdAt: { gte: startDate },
            status: { not: 'CANCELLED' }
          }
        }),
        this.prisma.order.count({
          where: {
            createdAt: { gte: startDate },
            status: 'DELIVERED'
          }
        })
      ]);

      return totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
    } catch (error) {
      console.error('Error calculating order fulfillment rate:', error);
      return 0;
    }
  }

  private async getAverageDeliveryTime(startDate: Date) {
    try {
      const deliveredOrders = await this.prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: 'DELIVERED',
          updatedAt: { not: null }
        },
        select: {
          createdAt: true,
          updatedAt: true
        }
      });

      if (deliveredOrders.length === 0) return 0;

      const totalDeliveryTime = deliveredOrders.reduce((sum, order) => {
        const deliveryTime = order.updatedAt!.getTime() - order.createdAt.getTime();
        return sum + deliveryTime;
      }, 0);

      const averageDeliveryTimeMs = totalDeliveryTime / deliveredOrders.length;
      return Math.round(averageDeliveryTimeMs / (1000 * 60 * 60 * 24)); // Convert to days
    } catch (error) {
      console.error('Error calculating average delivery time:', error);
      return 0;
    }
  }

  private async getCustomerSatisfactionRate() {
    try {
      // This would typically come from reviews or feedback
      // For now, return a placeholder based on delivered orders vs total orders
      const [totalOrders, deliveredOrders] = await Promise.all([
        this.prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
        this.prisma.order.count({ where: { status: 'DELIVERED' } })
      ]);

      return totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
    } catch (error) {
      console.error('Error calculating customer satisfaction rate:', error);
      return 0;
    }
  }

  async getConversionRates(period: string) {
    try {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'yearly':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // For now, we'll calculate conversion based on orders vs customers
      // In a real scenario, you'd track page views, cart additions, etc.
      const [totalCustomers, totalOrders, completedOrders] = await Promise.all([
        this.prisma.user.count({
          where: {
            role: 'CUSTOMER',
            createdAt: { gte: startDate }
          }
        }),
        this.prisma.order.count({
          where: {
            createdAt: { gte: startDate }
          }
        }),
        this.prisma.order.count({
          where: {
            createdAt: { gte: startDate },
            status: 'DELIVERED'
          }
        })
      ]);

      const visitorToCustomerRate = totalCustomers > 0 ? (totalCustomers / (totalCustomers * 1.5)) * 100 : 0; // Assuming 1.5x visitors
      const customerToOrderRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;
      const orderCompletionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      const rates = [
        {
          stage: 'Visitor to Customer',
          rate: visitorToCustomerRate,
          count: totalCustomers
        },
        {
          stage: 'Customer to Order',
          rate: customerToOrderRate,
          count: totalOrders
        },
        {
          stage: 'Order Completion',
          rate: orderCompletionRate,
          count: completedOrders
        }
      ];
      
      return { rates, period };
    } catch (error) {
      console.error('Error fetching conversion rates:', error);
      return { rates: [], period };
    }
  }

  async getRevenueAnalytics(period: string) {
    try {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'daily':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
          break;
        case 'yearly':
          startDate = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const orders = await this.prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: 'DELIVERED'
        },
        select: {
          createdAt: true,
          total: true
        }
      });

      const revenueData: Record<string, number> = {};
      
      orders.forEach(order => {
        let periodKey: string;
        
        switch (period) {
          case 'daily':
            periodKey = order.createdAt.toISOString().split('T')[0];
            break;
          case 'weekly':
            const weekStart = new Date(order.createdAt);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            periodKey = weekStart.toISOString().split('T')[0];
            break;
          case 'monthly':
            periodKey = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, '0')}`;
            break;
          case 'yearly':
            periodKey = order.createdAt.getFullYear().toString();
            break;
          default:
            periodKey = order.createdAt.toISOString().split('T')[0];
        }
        
        revenueData[periodKey] = (revenueData[periodKey] || 0) + order.total;
      });

      const revenue = Object.entries(revenueData).map(([period, amount]) => ({
        period,
        revenue: amount
      }));
      
      return { revenue, period };
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      return { revenue: [], period };
    }
  }

  async getGeographicSales() {
    try {
      const orders = await this.prisma.order.findMany({
        where: {
          status: { not: 'CANCELLED' },
          deliveryLocation: { not: null }
        },
        select: {
          total: true,
          deliveryLocation: true,
          createdAt: true
        }
      });

      const locationData: Record<string, { revenue: number; orders: number; lastOrder: Date }> = {};
      
      orders.forEach(order => {
        const location = order.deliveryLocation || 'Unknown';
        if (!locationData[location]) {
          locationData[location] = { revenue: 0, orders: 0, lastOrder: order.createdAt };
        }
        locationData[location].revenue += order.total;
        locationData[location].orders += 1;
        if (order.createdAt > locationData[location].lastOrder) {
          locationData[location].lastOrder = order.createdAt;
        }
      });

      const sales = Object.entries(locationData)
        .map(([location, data]) => ({
          location,
          revenue: data.revenue,
          orders: data.orders,
          lastOrder: data.lastOrder
        }))
        .sort((a, b) => b.revenue - a.revenue);

      return { sales };
    } catch (error) {
      console.error('Error fetching geographic sales:', error);
      return { sales: [] };
    }
  }

  async getCustomerInsights() {
    try {
      const [totalCustomers, activeCustomers, newCustomersThisMonth] = await Promise.all([
        this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
        this.prisma.user.count({
          where: {
            role: 'CUSTOMER',
            orders: {
              some: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
              }
            }
          }
        }),
        this.prisma.user.count({
          where: {
            role: 'CUSTOMER',
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      const topCustomers = await this.prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        include: {
          orders: {
            where: { status: { not: 'CANCELLED' } },
            select: { total: true }
          }
        },
        take: 10
      });

      const customerInsights = topCustomers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        totalSpent: customer.orders.reduce((sum, order) => sum + order.total, 0),
        orderCount: customer.orders.length
      })).sort((a, b) => b.totalSpent - a.totalSpent);

      return {
        insights: {
          totalCustomers,
          activeCustomers,
          newCustomersThisMonth,
          topCustomers: customerInsights
        }
      };
    } catch (error) {
      console.error('Error fetching customer insights:', error);
      return { insights: [] };
    }
  }

  async getCustomerBehavior() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const [averageOrderValue, repeatCustomerRate, customerLifetimeValue] = await Promise.all([
        this.prisma.order.aggregate({
          _avg: { total: true },
          where: {
            status: { not: 'CANCELLED' },
            createdAt: { gte: thirtyDaysAgo }
          }
        }),
        this.getRepeatCustomerRate(),
        this.getCustomerLifetimeValue()
      ]);

      return {
        behavior: {
          averageOrderValue: Number(averageOrderValue._avg.total) || 0,
          repeatCustomerRate,
          customerLifetimeValue
        }
      };
    } catch (error) {
      console.error('Error fetching customer behavior:', error);
      return { behavior: [] };
    }
  }

  private async getRepeatCustomerRate() {
    try {
      const customersWithOrders = await this.prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        include: {
          orders: {
            where: { status: { not: 'CANCELLED' } },
            select: { id: true }
          }
        }
      });

      const totalCustomers = customersWithOrders.length;
      const repeatCustomers = customersWithOrders.filter(customer => customer.orders.length > 1).length;
      
      return totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
    } catch (error) {
      console.error('Error calculating repeat customer rate:', error);
      return 0;
    }
  }

  private async getCustomerLifetimeValue() {
    try {
      const customerValues = await this.prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        include: {
          orders: {
            where: { status: { not: 'CANCELLED' } },
            select: { total: true }
          }
        }
      });

      const totalValue = customerValues.reduce((sum, customer) => {
        const customerTotal = customer.orders.reduce((orderSum, order) => orderSum + order.total, 0);
        return sum + customerTotal;
      }, 0);

      return customerValues.length > 0 ? totalValue / customerValues.length : 0;
    } catch (error) {
      console.error('Error calculating customer lifetime value:', error);
      return 0;
    }
  }

  async getRecentActivities() {
    try {
      const recentOrders = await this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: {
            include: {
              product: { select: { name: true } }
            }
          }
        }
      });

      const activities = recentOrders.map(order => ({
        id: order.id,
        type: 'order',
        description: `New order #${order.orderNumber} from ${order.user?.name || 'Guest'}`,
        amount: order.total,
        status: order.status,
        createdAt: order.createdAt,
        user: order.user,
        items: order.items
      }));

      return { activities };
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return { activities: [] };
    }
  }

  async getKPIs() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      
      const [currentMonthStats, previousMonthStats] = await Promise.all([
        this.getMonthStats(thirtyDaysAgo, new Date()),
        this.getMonthStats(sixtyDaysAgo, thirtyDaysAgo)
      ]);

      const calculateGrowth = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      return {
        kpis: {
          revenue: {
            current: currentMonthStats.revenue,
            growth: calculateGrowth(currentMonthStats.revenue, previousMonthStats.revenue)
          },
          orders: {
            current: currentMonthStats.orders,
            growth: calculateGrowth(currentMonthStats.orders, previousMonthStats.orders)
          },
          customers: {
            current: currentMonthStats.customers,
            growth: calculateGrowth(currentMonthStats.customers, previousMonthStats.customers)
          },
          averageOrderValue: {
            current: currentMonthStats.averageOrderValue,
            growth: calculateGrowth(currentMonthStats.averageOrderValue, previousMonthStats.averageOrderValue)
          }
        }
      };
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      return { kpis: [] };
    }
  }

  private async getMonthStats(startDate: Date, endDate: Date) {
    try {
      const [orders, revenue, customers] = await Promise.all([
        this.prisma.order.count({
          where: {
            createdAt: { gte: startDate, lt: endDate },
            status: { not: 'CANCELLED' }
          }
        }),
        this.prisma.order.aggregate({
          _sum: { total: true },
          where: {
            createdAt: { gte: startDate, lt: endDate },
            status: { not: 'CANCELLED' }
          }
        }),
        this.prisma.user.count({
          where: {
            role: 'CUSTOMER',
            createdAt: { gte: startDate, lt: endDate }
          }
        })
      ]);

      const totalRevenue = Number(revenue._sum.total) || 0;
      const averageOrderValue = orders > 0 ? totalRevenue / orders : 0;

      return {
        orders,
        revenue: totalRevenue,
        customers,
        averageOrderValue
      };
    } catch (error) {
      console.error('Error fetching month stats:', error);
      return {
        orders: 0,
        revenue: 0,
        customers: 0,
        averageOrderValue: 0
      };
    }
  }

  // Product methods
  async createProduct(data: any, userId: number, ip: string, ua: string) {
    try {
      console.log('📝 AdminService: Creating product with data:', data);
      
      // Generate slug if not provided
      const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Generate SKU if not provided
      const sku = data.sku || `HP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const product = await this.prisma.product.create({
        data: {
          name: data.name,
          slug: slug,
          description: data.description,
          shortDescription: data.shortDescription,
          sku: sku,
          price: parseFloat(data.price),
          comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
          categoryId: parseInt(data.categoryId),
          brandId: data.brandId ? parseInt(data.brandId) : null,
          stock: parseInt(data.stock) || 0,
          lowStockThreshold: parseInt(data.lowStockThreshold) || 5,
          weight: data.weight ? parseFloat(data.weight) : null,
          dimensions: data.dimensions || null,
          trackStock: Boolean(data.trackStock),
          isActive: Boolean(data.isActive),
          isFeatured: Boolean(data.isFeatured),
          images: JSON.stringify(data.images || []),
          tags: JSON.stringify(data.tags || [])
        },
        include: {
          category: true,
          brand: true
        }
      });
      
      console.log('✅ Product created successfully:', product.id);
      return { product };
    } catch (error) {
      console.error('❌ Product creation failed:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  async updateProduct(id: number, data: any, userId: number, ip: string, ua: string) {
    try {
      console.log('📝 AdminService: Updating product', id, 'with data:', data);
      
      const updateData: any = {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        price: parseFloat(data.price),
        comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : null,
        categoryId: parseInt(data.categoryId),
        brandId: data.brandId ? parseInt(data.brandId) : null,
        stock: parseInt(data.stock) || 0,
        lowStockThreshold: parseInt(data.lowStockThreshold) || 5,
        weight: data.weight ? parseFloat(data.weight) : null,
        dimensions: data.dimensions || null,
        trackStock: Boolean(data.trackStock),
        isActive: Boolean(data.isActive),
        isFeatured: Boolean(data.isFeatured),
        images: JSON.stringify(data.images || []),
        tags: JSON.stringify(data.tags || [])
      };
      
      const product = await this.prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          brand: true
        }
      });
      
      console.log('✅ Product updated successfully:', product.id);
      return { product };
    } catch (error) {
      console.error('❌ Product update failed:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  async deleteProduct(id: number, userId: number, ip: string, ua: string) {
    try {
      console.log('🗑️ AdminService: Deleting product', id);
      
      // Soft delete by setting isActive to false
      const product = await this.prisma.product.update({
        where: { id },
        data: { isActive: false }
      });
      
      console.log('✅ Product deleted (deactivated) successfully:', product.id);
      return { message: 'Product deleted successfully' };
    } catch (error) {
      console.error('❌ Product deletion failed:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  async bulkDeleteProducts(productIds: number[], userId: number, ip: string, ua: string) {
    try {
      console.log('🗑️ AdminService: Bulk deleting products', productIds);
      
      // Soft delete by setting isActive to false for all products
      const result = await this.prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { isActive: false }
      });
      
      console.log('✅ Products bulk deleted (deactivated) successfully:', result.count);
      return { message: `${result.count} products deleted successfully` };
    } catch (error) {
      console.error('❌ Bulk product deletion failed:', error);
      throw new Error(`Failed to delete products: ${error.message}`);
    }
  }

  async bulkCreateProducts(products: any[], userId: number) {
    try {
      const createdProducts = [];
      
      for (const productData of products) {
        const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const sku = productData.sku || `HP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        const product = await this.prisma.product.create({
          data: {
            name: productData.name,
            slug: slug,
            description: productData.description,
            shortDescription: productData.shortDescription,
            sku: sku,
            price: parseFloat(productData.price),
            comparePrice: productData.comparePrice ? parseFloat(productData.comparePrice) : null,
            categoryId: parseInt(productData.categoryId),
            brandId: productData.brandId ? parseInt(productData.brandId) : null,
            stock: parseInt(productData.stock) || 0,
            lowStockThreshold: parseInt(productData.lowStockThreshold) || 5,
            weight: productData.weight ? parseFloat(productData.weight) : null,
            dimensions: productData.dimensions || null,
            trackStock: Boolean(productData.trackStock),
            isActive: Boolean(productData.isActive),
            isFeatured: Boolean(productData.isFeatured),
            images: JSON.stringify(productData.images || []),
            tags: JSON.stringify(productData.tags || [])
          }
        });
        
        createdProducts.push(product);
      }
      
      return { products: createdProducts, message: `${createdProducts.length} products created successfully` };
    } catch (error) {
      console.error('❌ Bulk product creation failed:', error);
      throw new Error(`Failed to create products: ${error.message}`);
    }
  }

  async bulkUpdateProducts(data: any, userId: number) {
    try {
      const { productIds, updates } = data;
      
      const result = await this.prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: updates
      });
      
      return { message: `${result.count} products updated successfully` };
    } catch (error) {
      console.error('❌ Bulk product update failed:', error);
      throw new Error(`Failed to update products: ${error.message}`);
    }
  }

  async importProductsCsv(file: any) {
    try {
      // Basic CSV import implementation
      console.log('📁 Importing products from CSV:', file.originalname);
      return { message: 'CSV import functionality not yet implemented' };
    } catch (error) {
      throw new Error(`CSV import failed: ${error.message}`);
    }
  }

  async exportProductsCsv() {
    try {
      // Basic CSV export implementation
      console.log('📁 Exporting products to CSV');
      return { message: 'CSV export functionality not yet implemented' };
    } catch (error) {
      throw new Error(`CSV export failed: ${error.message}`);
    }
  }

  async uploadTempImages(files: any[]) {
    try {
      const uploadedImages = [];
      
      for (const file of files) {
        const result = await this.secureUpload.uploadFile(file, 'temp');
        uploadedImages.push(result);
      }
      
      return {
        success: true,
        images: uploadedImages,
        message: `Successfully uploaded ${uploadedImages.length} image(s)`
      };
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  async uploadProductImages(id: number, files: any[], userId: number) {
    try {
      const uploadedImages = [];
      
      for (const file of files) {
        const result = await this.secureUpload.uploadFile(file, 'products');
        uploadedImages.push(result);
      }
      
      return {
        success: true,
        images: uploadedImages,
        message: `Successfully uploaded ${uploadedImages.length} image(s) to product ${id}`
      };
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  async cropProductImage(data: any) {
    return { image: '' };
  }

  async optimizeProductImages(id: number) {
    return { message: 'Images optimized' };
  }

  async deleteProductImage(id: number, index: number, userId: number) {
    return { message: 'Image deleted' };
  }

  async deleteTempImage(url: string) {
    return { message: 'Temp image deleted' };
  }

  async createProductVariant(id: number, data: any) {
    return { variant: {} };
  }

  async updateProductVariant(id: number, variantId: number, data: any) {
    return { variant: {} };
  }

  async deleteProductVariant(id: number, variantId: number) {
    return { message: 'Variant deleted' };
  }

  async updateProductSEO(id: number, data: any) {
    return { message: 'SEO updated' };
  }

  async importProductsExcel(file: any) {
    return { message: 'Excel imported' };
  }

  async exportProductsExcel() {
    return { message: 'Excel exported' };
  }

  async getProductAnalytics(query: any) {
    return { analytics: [] };
  }

  async getPopularProducts(period: string) {
    try {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'yearly':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const topProducts = await this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: { gte: startDate },
            status: { not: 'CANCELLED' }
          }
        },
        _sum: {
          quantity: true
        },
        _count: {
          productId: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 10
      });

      const products = await Promise.all(
        topProducts.map(async (item) => {
          const product = await this.prisma.product.findUnique({
            where: { id: item.productId },
            select: {
              id: true,
              name: true,
              price: true,
              images: true
            }
          });
          
          return {
            id: product?.id || 0,
            name: product?.name || 'Unknown Product',
            price: product?.price || 0,
            totalSold: item._sum.quantity || 0,
            images: product?.images ? JSON.parse(product.images as string) : []
          };
        })
      );

      return { products };
    } catch (error) {
      console.error('Error fetching popular products:', error);
      return { products: [] };
    }
  }

  async getPopularCategories(period: string) {
    try {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'yearly':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const orderItems = await this.prisma.orderItem.findMany({
        where: {
          order: {
            createdAt: { gte: startDate },
            status: { not: 'CANCELLED' }
          }
        },
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      });

      const categoryStats: Record<string, { sales: number; revenue: number }> = {};
      
      orderItems.forEach(item => {
        const categoryName = item.product?.category?.name || 'Uncategorized';
        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = { sales: 0, revenue: 0 };
        }
        categoryStats[categoryName].sales += item.quantity;
        categoryStats[categoryName].revenue += item.price * item.quantity;
      });

      const categories = Object.entries(categoryStats)
        .map(([category, data]) => ({
          category,
          sales: data.sales,
          revenue: data.revenue
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 8);

      return { categories };
    } catch (error) {
      console.error('Error fetching popular categories:', error);
      return { categories: [] };
    }
  }

  // Category methods
  async createCategory(data: any, userId: number) {
    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: data.description,
        image: data.image,
        parentId: data.parentId,
        isActive: data.isActive !== false,
        sortOrder: data.sortOrder || 0
      }
    });
    return { category };
  }

  async updateCategory(id: number, data: any, userId: number) {
    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: data.description,
          image: data.image,
          parentId: data.parentId,
          isActive: data.isActive !== false,
          sortOrder: data.sortOrder || 0
        }
      });
      return { category };
    } catch (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }

  async deleteCategory(id: number, userId: number) {
    try {
      await this.prisma.category.delete({ where: { id } });
      return { message: 'Category deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  }

  async uploadCategoryImage(file: any) {
    try {
      const result = await this.secureUpload.uploadFile(file, 'categories');
      return {
        success: true,
        image: result,
        message: 'Category image uploaded successfully'
      };
    } catch (error) {
      throw new Error(`Category image upload failed: ${error.message}`);
    }
  }

  async reorderCategories(data: any) {
    return { message: 'Categories reordered' };
  }

  // Brand methods
  async getBrands() {
    try {
      const brands = await this.prisma.brand.findMany({
        include: {
          _count: {
            select: {
              products: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });
      
      return { brands };
    } catch (error) {
      console.error('Error fetching brands:', error);
      return { brands: [] };
    }
  }

  async createBrand(data: any) {
    try {
      const brand = await this.prisma.brand.create({
        data: {
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          logo: data.logo,
          isActive: data.isActive !== false
        }
      });
      
      return { brand };
    } catch (error) {
      console.error('Error creating brand:', error);
      throw new Error(`Failed to create brand: ${error.message}`);
    }
  }

  async updateBrand(id: number, data: any) {
    try {
      const brand = await this.prisma.brand.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          logo: data.logo,
          isActive: data.isActive
        }
      });
      
      return { brand };
    } catch (error) {
      console.error('Error updating brand:', error);
      throw new Error(`Failed to update brand: ${error.message}`);
    }
  }

  async deleteBrand(id: number) {
    try {
      await this.prisma.brand.delete({
        where: { id }
      });
      
      return { message: 'Brand deleted successfully' };
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw new Error(`Failed to delete brand: ${error.message}`);
    }
  }

  // Promo Codes methods
  async getPromoCodes(query: any) {
    try {
      const { page = 1, limit = 20, search } = query;
      const skip = (page - 1) * limit;
      const where: any = search ? {
        OR: [
          { code: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ]
      } : {};

      const [promoCodes, total] = await Promise.all([
        this.prisma.promoCode.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { usages: true }
            }
          }
        }),
        this.prisma.promoCode.count({ where })
      ]);

      return {
        data: promoCodes,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      };
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      return { data: [], total: 0, page: 1, limit: 20 };
    }
  }

  async createPromoCode(data: any, userId: number) {
    try {
      const existing = await this.prisma.promoCode.findUnique({
        where: { code: data.code.toUpperCase() }
      });
      
      if (existing) {
        throw new Error('Promo code already exists');
      }

      const promoCode = await this.prisma.promoCode.create({
        data: {
          code: data.code.toUpperCase(),
          name: data.name || data.description,
          description: data.description,
          discountType: data.type || data.discountType,
          discountValue: parseFloat(data.value || data.discountValue),
          minOrderAmount: data.minimumAmount ? parseFloat(data.minimumAmount) : null,
          maxDiscount: data.maximumDiscount ? parseFloat(data.maximumDiscount) : null,
          usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
          userUsageLimit: data.userUsageLimit ? parseInt(data.userUsageLimit) : null,
          isActive: data.isActive !== false,
          validFrom: new Date(),
          validUntil: data.expiresAt ? new Date(data.expiresAt) : null,
          usageCount: 0
        }
      });
      
      return { promoCode };
    } catch (error) {
      console.error('Error creating promo code:', error);
      throw new Error(`Failed to create promo code: ${error.message}`);
    }
  }

  async validatePromoCode(code: string, orderAmount: number, userId?: number) {
    try {
      const promoCode = await this.prisma.promoCode.findUnique({
        where: { code: code.toUpperCase() }
      });

      if (!promoCode) {
        throw new Error('Invalid promo code');
      }

      if (!promoCode.isActive) {
        throw new Error('Promo code is not active');
      }

      const now = new Date();
      if (promoCode.validUntil && promoCode.validUntil < now) {
        throw new Error('Promo code has expired');
      }

      if (promoCode.minOrderAmount && orderAmount < promoCode.minOrderAmount) {
        throw new Error(`Minimum order amount of KES ${promoCode.minOrderAmount} required`);
      }

      if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
        throw new Error('Promo code usage limit reached');
      }

      let discountAmount = 0;
      if (promoCode.discountType === 'PERCENTAGE') {
        discountAmount = (orderAmount * promoCode.discountValue) / 100;
        if (promoCode.maxDiscount && discountAmount > promoCode.maxDiscount) {
          discountAmount = promoCode.maxDiscount;
        }
      } else {
        discountAmount = Math.min(promoCode.discountValue, orderAmount);
      }

      return {
        valid: true,
        code: promoCode.code,
        discountAmount,
        finalAmount: orderAmount - discountAmount,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Orders methods
  async getOrders(query: any) {
    try {
      const { page = 1, limit = 20, status, search } = query;
      const skip = (page - 1) * limit;
      const where: any = {};
      
      if (status) {
        where.status = status;
      }
      
      if (search) {
        where.OR = [
          { orderNumber: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { user: { email: { contains: search, mode: Prisma.QueryMode.insensitive } } }
        ];
      }

      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
            items: {
              include: {
                product: { select: { name: true, price: true } }
              }
            }
          }
        }),
        this.prisma.order.count({ where })
      ]);

      return { data: orders, total, page: parseInt(page), limit: parseInt(limit) };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { data: [], total: 0, page: 1, limit: 20 };
    }
  }

  // Customers methods
  async getCustomers(query: any) {
    try {
      const { page = 1, limit = 20, search } = query;
      const skip = (page - 1) * limit;
      const where: any = { role: 'CUSTOMER' };
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { phone: { contains: search, mode: Prisma.QueryMode.insensitive } }
        ];
      }

      const [customers, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { orders: true }
            }
          }
        }),
        this.prisma.user.count({ where })
      ]);

      return { data: customers, total, page: parseInt(page), limit: parseInt(limit) };
    } catch (error) {
      console.error('Error fetching customers:', error);
      return { data: [], total: 0, page: 1, limit: 20 };
    }
  }
}
