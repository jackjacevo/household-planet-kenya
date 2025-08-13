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
exports.PushService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PushService = class PushService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async subscribe(userId, subscription) {
        try {
            const result = await this.prisma.$executeRaw `
        INSERT OR REPLACE INTO push_subscriptions (user_id, subscription, active, created_at, updated_at)
        VALUES (${userId}, ${JSON.stringify(subscription)}, 1, datetime('now'), datetime('now'))
      `;
            return { success: true };
        }
        catch (error) {
            console.error('Push subscription error:', error);
            throw error;
        }
    }
    async sendNotification(userId, payload) {
        try {
            const subscription = await this.prisma.$queryRaw `
        SELECT subscription FROM push_subscriptions 
        WHERE user_id = ${userId} AND active = 1
      `;
            if (!subscription.length) {
                return { success: false, error: 'No active subscription' };
            }
            console.log('Sending push notification:', payload);
            return { success: true };
        }
        catch (error) {
            console.error('Send notification error:', error);
            return { success: false, error: error.message };
        }
    }
    async sendOrderUpdate(userId, orderId, status) {
        const statusMessages = {
            confirmed: 'Your order has been confirmed!',
            processing: 'Your order is being prepared',
            shipped: 'Your order has been shipped',
            delivered: 'Your order has been delivered'
        };
        await this.sendNotification(userId, {
            title: 'Order Update',
            body: statusMessages[status] || 'Order status updated',
            url: `/orders/${orderId}`
        });
    }
    async sendAbandonedCartReminder(userId) {
        await this.sendNotification(userId, {
            title: 'Don\'t forget your items!',
            body: 'Complete your purchase and get fast delivery',
            url: '/cart'
        });
    }
    async sendPromotion(userId, title, message, url) {
        await this.sendNotification(userId, {
            title,
            body: message,
            url: url || '/products'
        });
    }
};
exports.PushService = PushService;
exports.PushService = PushService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PushService);
//# sourceMappingURL=push.service.js.map