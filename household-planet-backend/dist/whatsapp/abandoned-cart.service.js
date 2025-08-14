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
var AbandonedCartService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbandonedCartService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const whatsapp_service_1 = require("./whatsapp.service");
let AbandonedCartService = AbandonedCartService_1 = class AbandonedCartService {
    constructor(prisma, whatsappService) {
        this.prisma = prisma;
        this.whatsappService = whatsappService;
        this.logger = new common_1.Logger(AbandonedCartService_1.name);
    }
    async trackAbandonedCart(userId, sessionId, phoneNumber, cartItems) {
        try {
            const userIdStr = userId ? (typeof userId === 'string' ? userId : String(userId)) : undefined;
            const cartData = JSON.stringify(cartItems || []);
            const existingCart = await this.prisma.abandonedCart.findFirst({
                where: {
                    OR: [
                        { userId: userIdStr || undefined },
                        { sessionId: sessionId || undefined },
                        { phoneNumber: phoneNumber || undefined },
                    ],
                    isRecovered: false,
                },
            });
            if (existingCart) {
                await this.prisma.abandonedCart.update({
                    where: { id: existingCart.id },
                    data: {
                        cartData,
                        updatedAt: new Date(),
                    },
                });
            }
            else {
                await this.prisma.abandonedCart.create({
                    data: {
                        userId: userIdStr,
                        sessionId,
                        phoneNumber,
                        cartData,
                    },
                });
            }
            this.logger.log(`Tracked abandoned cart for ${userIdStr || sessionId || phoneNumber}`);
        }
        catch (error) {
            this.logger.error('Failed to track abandoned cart:', error);
        }
    }
    async markCartAsRecovered(userId, sessionId, phoneNumber) {
        try {
            const userIdStr = userId ? (typeof userId === 'string' ? userId : String(userId)) : undefined;
            await this.prisma.abandonedCart.updateMany({
                where: {
                    OR: [
                        { userId: userIdStr || undefined },
                        { sessionId: sessionId || undefined },
                        { phoneNumber: phoneNumber || undefined },
                    ],
                    isRecovered: false,
                },
                data: {
                    isRecovered: true,
                    recoveredAt: new Date(),
                },
            });
            this.logger.log(`Marked cart as recovered for ${userIdStr || sessionId || phoneNumber}`);
        }
        catch (error) {
            this.logger.error('Failed to mark cart as recovered:', error);
        }
    }
    async sendAbandonedCartReminders() {
        try {
            const now = new Date();
            const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
            const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const firstReminders = await this.prisma.abandonedCart.findMany({
                where: {
                    isRecovered: false,
                    remindersSent: 0,
                    createdAt: {
                        lte: twoHoursAgo,
                        gte: twentyFourHoursAgo,
                    },
                    phoneNumber: { not: null },
                },
                include: {
                    user: true,
                },
            });
            for (const cart of firstReminders) {
                const cartItems = JSON.parse(cart.cartData || '[]');
                if (cartItems.length > 0) {
                    const success = await this.whatsappService.sendAbandonedCartReminder(cart.phoneNumber, cartItems, cart.userId);
                    if (success) {
                        await this.prisma.abandonedCart.update({
                            where: { id: cart.id },
                            data: {
                                remindersSent: 1,
                                lastReminderAt: new Date(),
                            },
                        });
                    }
                }
            }
            const secondReminders = await this.prisma.abandonedCart.findMany({
                where: {
                    isRecovered: false,
                    remindersSent: 1,
                    lastReminderAt: {
                        lte: twentyFourHoursAgo,
                    },
                    phoneNumber: { not: null },
                },
                include: {
                    user: true,
                },
            });
            for (const cart of secondReminders) {
                const cartItems = JSON.parse(cart.cartData || '[]');
                if (cartItems.length > 0) {
                    const message = `🛒 Last chance!\n\nYour cart is still waiting with ${cartItems.length} item${cartItems.length > 1 ? 's' : ''}.\n\nGet 10% OFF with code COMEBACK10\n\n🔗 Complete your order: https://householdplanet.co.ke/cart`;
                    const success = await this.whatsappService.sendMessage(cart.phoneNumber, message, 'ABANDONED_CART', null, cart.userId);
                    if (success) {
                        await this.prisma.abandonedCart.update({
                            where: { id: cart.id },
                            data: {
                                remindersSent: 2,
                                lastReminderAt: new Date(),
                            },
                        });
                    }
                }
            }
            this.logger.log(`Sent ${firstReminders.length} first reminders and ${secondReminders.length} second reminders`);
        }
        catch (error) {
            this.logger.error('Failed to send abandoned cart reminders:', error);
        }
    }
    async getAbandonedCartStats() {
        const [total, recovered, withReminders] = await Promise.all([
            this.prisma.abandonedCart.count(),
            this.prisma.abandonedCart.count({ where: { isRecovered: true } }),
            this.prisma.abandonedCart.count({ where: { remindersSent: { gt: 0 } } }),
        ]);
        const recoveryRate = total > 0 ? (recovered / total) * 100 : 0;
        return {
            total,
            recovered,
            withReminders,
            recoveryRate: Math.round(recoveryRate * 100) / 100,
        };
    }
};
exports.AbandonedCartService = AbandonedCartService;
__decorate([
    (0, schedule_1.Cron)('0 */2 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbandonedCartService.prototype, "sendAbandonedCartReminders", null);
exports.AbandonedCartService = AbandonedCartService = AbandonedCartService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsAppService])
], AbandonedCartService);
//# sourceMappingURL=abandoned-cart.service.js.map