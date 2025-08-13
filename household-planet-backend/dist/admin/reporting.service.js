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
exports.ReportingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportingService = class ReportingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateSalesReport(startDate, endDate) {
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
    async generateFinancialReport(startDate, endDate) {
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
    async getSalesData(startDate, endDate) {
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
    async getTopProducts(startDate, endDate) {
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
    async getSalesByLocation(startDate, endDate) {
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
    async getCustomerStats() {
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
    async getTopCustomers() {
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
    async getCustomerGrowth() {
        return this.prisma.$queryRaw `
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
    async getCustomerRetention() {
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
    async getStockLevels() {
        return this.prisma.product.aggregate({
            _sum: { stock: true },
            _count: true,
            where: { isActive: true }
        });
    }
    async getLowStockItems() {
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
    async getTopSellingProducts() {
        return this.prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 10
        });
    }
    async getSlowMovingProducts() {
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
    async getRevenue(startDate, endDate) {
        return this.prisma.order.aggregate({
            _sum: { total: true },
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: { not: 'CANCELLED' }
            }
        });
    }
    async getExpenses(startDate, endDate) {
        const orders = await this.prisma.order.aggregate({
            _sum: { shippingCost: true },
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: { not: 'CANCELLED' }
            }
        });
        return { shipping: orders._sum.shippingCost || 0 };
    }
    async getProfit(startDate, endDate) {
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
    async getPaymentMethodBreakdown(startDate, endDate) {
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
};
exports.ReportingService = ReportingService;
exports.ReportingService = ReportingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportingService);
//# sourceMappingURL=reporting.service.js.map