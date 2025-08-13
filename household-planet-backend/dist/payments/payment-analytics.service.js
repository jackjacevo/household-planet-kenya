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
exports.PaymentAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentAnalyticsService = class PaymentAnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPaymentAnalytics(startDate, endDate) {
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
            this.prisma.$queryRaw `
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
};
exports.PaymentAnalyticsService = PaymentAnalyticsService;
exports.PaymentAnalyticsService = PaymentAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentAnalyticsService);
//# sourceMappingURL=payment-analytics.service.js.map