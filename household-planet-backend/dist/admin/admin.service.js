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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardOverview() {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const [todaysSales, pendingOrders, lowStockProducts, totalCustomers, monthlyRevenue, totalOrders, averageOrderValue, conversionRate] = await Promise.all([
            this.getTodaysSales(startOfDay),
            this.getPendingOrders(),
            this.getLowStockProducts(),
            this.getTotalCustomers(),
            this.getMonthlyRevenue(startOfMonth),
            this.getTotalOrders(),
            this.getAverageOrderValue(),
            this.getConversionRate()
        ]);
        return {
            todaysSales,
            pendingOrders,
            lowStockProducts,
            totalCustomers,
            monthlyRevenue,
            totalOrders,
            averageOrderValue,
            conversionRate
        };
    }
    async getTodaysSales(startOfDay) {
        const result = await this.prisma.order.aggregate({
            _sum: { total: true },
            _count: true,
            where: {
                createdAt: { gte: startOfDay },
                status: { not: 'CANCELLED' }
            }
        });
        return {
            revenue: result._sum.total || 0,
            count: result._count
        };
    }
    async getPendingOrders() {
        return this.prisma.order.count({
            where: { status: { in: ['PENDING', 'PROCESSING', 'CONFIRMED'] } }
        });
    }
    async getLowStockProducts() {
        return this.prisma.product.count({
            where: {
                stock: { lte: this.prisma.product.fields.lowStockThreshold },
                isActive: true
            }
        });
    }
    async getTotalCustomers() {
        return this.prisma.user.count({
            where: { role: 'CUSTOMER' }
        });
    }
    async getMonthlyRevenue(startOfMonth) {
        const result = await this.prisma.order.aggregate({
            _sum: { total: true },
            where: {
                createdAt: { gte: startOfMonth },
                status: { not: 'CANCELLED' }
            }
        });
        return result._sum.total || 0;
    }
    async getTotalOrders() {
        return this.prisma.order.count({
            where: { status: { not: 'CANCELLED' } }
        });
    }
    async getAverageOrderValue() {
        const result = await this.prisma.order.aggregate({
            _avg: { total: true },
            where: { status: { not: 'CANCELLED' } }
        });
        return result._avg.total || 0;
    }
    async getConversionRate() {
        const [totalUsers, usersWithOrders] = await Promise.all([
            this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
            this.prisma.user.count({
                where: {
                    role: 'CUSTOMER',
                    orders: { some: { status: { not: 'CANCELLED' } } }
                }
            })
        ]);
        return totalUsers > 0 ? (usersWithOrders / totalUsers * 100) : 0;
    }
    async getSystemAlerts() {
        const [lowStockAlerts, failedPayments, pendingReturns] = await Promise.all([
            this.getLowStockAlerts(),
            this.getFailedPayments(),
            this.getPendingReturns()
        ]);
        return {
            lowStock: lowStockAlerts,
            failedPayments,
            pendingReturns
        };
    }
    async getLowStockAlerts() {
        return this.prisma.product.findMany({
            where: {
                stock: { lte: this.prisma.product.fields.lowStockThreshold },
                isActive: true
            },
            select: {
                id: true,
                name: true,
                stock: true,
                lowStockThreshold: true
            },
            take: 10
        });
    }
    async getFailedPayments() {
        return this.prisma.payment.count({
            where: {
                status: 'FAILED',
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }
        });
    }
    async getPendingReturns() {
        return this.prisma.returnRequest.count({
            where: { status: 'PENDING' }
        });
    }
    async getRecentActivities(limit) {
        const [recentOrders, newCustomers, newReviews] = await Promise.all([
            this.prisma.order.findMany({
                take: Math.floor(limit / 3),
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true, email: true } } }
            }),
            this.prisma.user.findMany({
                where: { role: 'CUSTOMER' },
                take: Math.floor(limit / 3),
                orderBy: { createdAt: 'desc' },
                select: { name: true, email: true, createdAt: true }
            }),
            this.prisma.review.findMany({
                take: Math.floor(limit / 3),
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true } },
                    product: { select: { name: true } }
                }
            })
        ]);
        const activities = [
            ...recentOrders.map(order => ({
                type: 'order',
                message: `New order #${order.orderNumber} from ${order.user?.name || 'Guest'}`,
                timestamp: order.createdAt,
                amount: order.total
            })),
            ...newCustomers.map(customer => ({
                type: 'customer',
                message: `New customer registered: ${customer.name}`,
                timestamp: customer.createdAt
            })),
            ...newReviews.map(review => ({
                type: 'review',
                message: `${review.user.name} reviewed ${review.product.name}`,
                timestamp: review.createdAt,
                rating: review.rating
            }))
        ];
        return activities
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map