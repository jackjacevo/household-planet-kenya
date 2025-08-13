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
exports.TrackingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const sms_service_1 = require("./sms.service");
let TrackingService = class TrackingService {
    constructor(prisma, smsService) {
        this.prisma = prisma;
        this.smsService = smsService;
    }
    async createTracking(orderId) {
        return this.prisma.deliveryTracking.create({
            data: { orderId, status: 'ORDER_PLACED' }
        });
    }
    async updateStatus(orderId, status, location, notes) {
        const tracking = await this.prisma.deliveryTracking.update({
            where: { orderId },
            data: { status, location, notes, updatedAt: new Date() },
            include: { order: { include: { user: true } } }
        });
        await this.prisma.deliveryUpdate.create({
            data: { trackingId: tracking.id, status, location, notes }
        });
        if (tracking.order.user.phone) {
            await this.smsService.sendDeliveryUpdate(tracking.order.user.phone, tracking.order.orderNumber, status);
        }
        return tracking;
    }
    async confirmDelivery(orderId, photoProof) {
        const tracking = await this.prisma.deliveryTracking.update({
            where: { orderId },
            data: {
                status: 'DELIVERED',
                photoProof,
                deliveredAt: new Date()
            },
            include: { order: { include: { user: true } } }
        });
        if (tracking.order.user.phone) {
            await this.smsService.sendDeliveryConfirmation(tracking.order.user.phone, tracking.order.orderNumber);
        }
        return tracking;
    }
    async getTracking(orderId) {
        const tracking = await this.prisma.deliveryTracking.findUnique({
            where: { orderId },
            include: { updates: { orderBy: { timestamp: 'desc' } } }
        });
        if (!tracking) {
            throw new common_1.NotFoundException('Tracking information not found');
        }
        return tracking;
    }
    async handleFailedDelivery(orderId, reason) {
        return this.updateStatus(orderId, 'DELIVERY_FAILED', undefined, reason);
    }
};
exports.TrackingService = TrackingService;
exports.TrackingService = TrackingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        sms_service_1.SmsService])
], TrackingService);
//# sourceMappingURL=tracking.service.js.map