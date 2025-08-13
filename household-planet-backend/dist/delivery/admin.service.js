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
exports.AdminDeliveryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminDeliveryService = class AdminDeliveryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async bulkUpdateStatus(orderIds, status, notes) {
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
};
exports.AdminDeliveryService = AdminDeliveryService;
exports.AdminDeliveryService = AdminDeliveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminDeliveryService);
//# sourceMappingURL=admin.service.js.map