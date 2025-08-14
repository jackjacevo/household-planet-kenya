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
const webpush = require("web-push");
let PushService = class PushService {
    constructor(prisma) {
        this.prisma = prisma;
        if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
            webpush.setVapidDetails('mailto:admin@householdplanet.co.ke', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
        }
    }
    async subscribe(userId, subscription) {
        try {
            const result = await this.prisma.$executeRaw `
        INSERT OR REPLACE INTO push_subscriptions (user_id, subscription, active, created_at, updated_at)
        VALUES (${userId}, ${JSON.stringify(subscription)}, 1, datetime('now'), datetime('now'))
      `;
            setTimeout(() => {
                this.sendWelcomeNotification(userId);
            }, 2000);
            return { success: true };
        }
        catch (error) {
            console.error('Push subscription error:', error);
            throw error;
        }
    }
    async unsubscribe(endpoint) {
        try {
            await this.prisma.$executeRaw `
        UPDATE push_subscriptions 
        SET active = 0, updated_at = datetime('now')
        WHERE JSON_EXTRACT(subscription, '$.endpoint') = ${endpoint}
      `;
            return { success: true };
        }
        catch (error) {
            console.error('Push unsubscribe error:', error);
            return { success: false, error: error.message };
        }
    }
    getVapidPublicKey() {
        return {
            publicKey: process.env.VAPID_PUBLIC_KEY || 'demo-key-replace-in-production'
        };
    }
    async sendNotification(userId, payload) {
        try {
            const subscriptions = await this.prisma.$queryRaw `
        SELECT subscription FROM push_subscriptions 
        WHERE user_id = ${userId} AND active = 1
      `;
            if (!subscriptions.length) {
                return { success: false, error: 'No active subscription' };
            }
            const notificationPayload = {
                title: payload.title,
                body: payload.body,
                icon: payload.icon || '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                url: payload.url || '/',
                tag: payload.tag || 'general',
                requireInteraction: payload.requireInteraction || false,
                actions: payload.actions || [
                    { action: 'view', title: 'View' },
                    { action: 'dismiss', title: 'Dismiss' }
                ],
                timestamp: Date.now(),
                vibrate: [200, 100, 200]
            };
            const results = [];
            for (const sub of subscriptions) {
                try {
                    const subscription = JSON.parse(sub.subscription);
                    await webpush.sendNotification(subscription, JSON.stringify(notificationPayload));
                    results.push({ success: true });
                }
                catch (error) {
                    console.error('Failed to send to subscription:', error);
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        await this.removeInvalidSubscription(sub.subscription);
                    }
                    results.push({ success: false, error: error.message });
                }
            }
            const successCount = results.filter(r => r.success).length;
            return {
                success: successCount > 0,
                sent: successCount,
                total: subscriptions.length
            };
        }
        catch (error) {
            console.error('Send notification error:', error);
            return { success: false, error: error.message };
        }
    }
    async removeInvalidSubscription(subscriptionJson) {
        try {
            await this.prisma.$executeRaw `
        DELETE FROM push_subscriptions 
        WHERE subscription = ${subscriptionJson}
      `;
        }
        catch (error) {
            console.error('Failed to remove invalid subscription:', error);
        }
    }
    async sendOrderUpdate(userId, orderId, status) {
        const statusMessages = {
            confirmed: {
                title: '✅ Order Confirmed!',
                body: 'Your order has been confirmed and is being processed',
                icon: '/icons/icon-192x192.png'
            },
            processing: {
                title: '🔄 Order Processing',
                body: 'Your order is being prepared for shipment',
                icon: '/icons/icon-192x192.png'
            },
            shipped: {
                title: '🚚 Order Shipped!',
                body: 'Your order is on its way to you',
                icon: '/icons/icon-192x192.png'
            },
            delivered: {
                title: '📦 Order Delivered!',
                body: 'Your order has been successfully delivered',
                icon: '/icons/icon-192x192.png'
            }
        };
        const message = statusMessages[status] || {
            title: 'Order Update',
            body: 'Your order status has been updated',
            icon: '/icons/icon-192x192.png'
        };
        await this.sendNotification(userId, {
            ...message,
            url: `/orders/${orderId}`,
            tag: `order-${orderId}`,
            requireInteraction: status === 'delivered',
            actions: [
                { action: 'view', title: 'View Order' },
                { action: 'track', title: 'Track Package' }
            ]
        });
    }
    async sendAbandonedCartReminder(userId, cartItems) {
        const itemText = cartItems ? `${cartItems} item${cartItems > 1 ? 's' : ''}` : 'items';
        await this.sendNotification(userId, {
            title: '🛒 Don\'t forget your items!',
            body: `You have ${itemText} waiting in your cart. Complete your purchase now!`,
            url: '/cart',
            tag: 'abandoned-cart',
            actions: [
                { action: 'view', title: 'View Cart' },
                { action: 'checkout', title: 'Checkout Now' }
            ]
        });
    }
    async sendPromotion(userId, title, message, url) {
        await this.sendNotification(userId, {
            title: `🎉 ${title}`,
            body: message,
            url: url || '/products',
            tag: 'promotion',
            actions: [
                { action: 'view', title: 'Shop Now' },
                { action: 'save', title: 'Save for Later' }
            ]
        });
    }
    async sendWelcomeNotification(userId) {
        await this.sendNotification(userId, {
            title: '🏠 Welcome to Household Planet!',
            body: 'Thanks for enabling notifications. Get updates on orders, deals, and more!',
            url: '/',
            tag: 'welcome',
            requireInteraction: true
        });
    }
    async sendLowStockAlert(userId, productName, productId) {
        await this.sendNotification(userId, {
            title: '⚠️ Low Stock Alert',
            body: `${productName} is running low. Order now to avoid missing out!`,
            url: `/products/${productId}`,
            tag: `low-stock-${productId}`,
            actions: [
                { action: 'view', title: 'View Product' },
                { action: 'add-to-cart', title: 'Add to Cart' }
            ]
        });
    }
    async sendDeliveryUpdate(userId, orderId, message) {
        await this.sendNotification(userId, {
            title: '🚚 Delivery Update',
            body: message,
            url: `/orders/${orderId}`,
            tag: `delivery-${orderId}`,
            actions: [
                { action: 'track', title: 'Track Order' },
                { action: 'contact', title: 'Contact Driver' }
            ]
        });
    }
    async broadcastNotification(payload) {
        try {
            let subscriptions;
            if (payload.userIds && payload.userIds.length > 0) {
                const userIdList = payload.userIds.map(id => `'${id}'`).join(',');
                subscriptions = await this.prisma.$queryRawUnsafe(`
          SELECT user_id, subscription FROM push_subscriptions 
          WHERE user_id IN (${userIdList}) AND active = 1
        `);
            }
            else {
                subscriptions = await this.prisma.$queryRaw `
          SELECT user_id, subscription FROM push_subscriptions 
          WHERE active = 1
        `;
            }
            const results = [];
            for (const sub of subscriptions) {
                const result = await this.sendNotification(sub.user_id, payload);
                results.push(result);
            }
            const successCount = results.filter(r => r.success).length;
            return {
                success: true,
                sent: successCount,
                total: subscriptions.length
            };
        }
        catch (error) {
            console.error('Broadcast notification error:', error);
            return { success: false, error: error.message };
        }
    }
};
exports.PushService = PushService;
exports.PushService = PushService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PushService);
//# sourceMappingURL=push.service.js.map