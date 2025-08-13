"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSalesAnalytics(period) {
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
    parsePeriod(period) {
        const periodMap = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '1y': 365
        };
        return periodMap[period] || 30;
    }
    async getDailySales(startDate) {
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
    async getWeeklySales(startDate) {
        const sales = await this.prisma.$queryRaw `
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
    async getMonthlySales() {
        const sales = await this.prisma.$queryRaw `
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
    async getTopSellingProducts(startDate) {
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
    async getNewCustomersOverTime() {
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
    async getCustomerRetentionRate() {
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
    async getTopCustomers() {
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
    async getCustomersByLocation() {
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
    async getMostViewedProducts() {
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
    async getBestRatedProducts() {
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
    async getCategoryPerformance() {
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
    async getInventoryStatus() {
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
    async getSalesByCounty() {
        return this.prisma.$queryRaw `
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
    async getDeliveryPerformanceByLocation() {
        return this.prisma.order.groupBy({
            by: ['deliveryLocation'],
            _count: { deliveryLocation: true },
            _avg: { deliveryPrice: true },
            where: { status: { not: 'CANCELLED' } },
            orderBy: { _count: { deliveryLocation: 'desc' } }
        });
    }
    async getPopularDeliveryLocations() {
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
    async getRevenueKPI() {
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
    async getOrdersKPI() {
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
    async getCustomersKPI() {
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
    async getConversionKPI() {
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
        return { current, change: 0 };
    }
    async getRetentionKPI() {
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
        return { current, change: 0 };
    }
    async getAverageOrderKPI() {
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map