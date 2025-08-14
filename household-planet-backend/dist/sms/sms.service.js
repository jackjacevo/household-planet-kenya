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
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = require("axios");
let SmsService = SmsService_1 = class SmsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SmsService_1.name);
        this.apiKey = process.env.AFRICAS_TALKING_API_KEY;
        this.username = process.env.AFRICAS_TALKING_USERNAME;
        this.baseUrl = 'https://api.africastalking.com/version1';
    }
    async sendSms(phoneNumber, message, type = 'GENERAL') {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/messaging`, {
                username: this.username,
                to: this.formatPhoneNumber(phoneNumber),
                message,
            }, {
                headers: {
                    'apiKey': this.apiKey,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            await this.logSms(phoneNumber, message, type, 'SENT');
            this.logger.log(`SMS sent to ${phoneNumber}: ${message.substring(0, 50)}...`);
            return true;
        }
        catch (error) {
            await this.logSms(phoneNumber, message, type, 'FAILED', error.message);
            this.logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
            return false;
        }
    }
    async sendOrderConfirmation(phoneNumber, orderNumber, total) {
        const message = `Order confirmed! #${orderNumber} - KSh ${total.toLocaleString()}. Track: https://householdplanet.co.ke/orders/${orderNumber}`;
        return this.sendSms(phoneNumber, message, 'ORDER_CONFIRMATION');
    }
    async sendPaymentConfirmation(phoneNumber, orderNumber, amount, method) {
        const message = `Payment received! KSh ${amount.toLocaleString()} via ${method} for order #${orderNumber}. Thank you!`;
        return this.sendSms(phoneNumber, message, 'PAYMENT_CONFIRMATION');
    }
    async sendShippingNotification(phoneNumber, orderNumber, trackingNumber) {
        const message = trackingNumber
            ? `Your order #${orderNumber} has shipped! Tracking: ${trackingNumber}. Delivery in 1-3 days.`
            : `Your order #${orderNumber} has shipped! Delivery in 1-3 days.`;
        return this.sendSms(phoneNumber, message, 'SHIPPING_NOTIFICATION');
    }
    async sendDeliveryNotification(phoneNumber, orderNumber, deliveryTime) {
        const message = deliveryTime
            ? `Your order #${orderNumber} will be delivered ${deliveryTime}. Please be available.`
            : `Your order #${orderNumber} is out for delivery today. Please be available.`;
        return this.sendSms(phoneNumber, message, 'DELIVERY_NOTIFICATION');
    }
    async sendOtp(phoneNumber, otp) {
        const message = `Your Household Planet Kenya verification code is: ${otp}. Valid for 10 minutes. Do not share.`;
        await this.prisma.otpCode.create({
            data: {
                phoneNumber,
                code: otp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
        });
        return this.sendSms(phoneNumber, message, 'OTP');
    }
    async verifyOtp(phoneNumber, code) {
        const otpRecord = await this.prisma.otpCode.findFirst({
            where: {
                phoneNumber,
                code,
                isUsed: false,
                expiresAt: { gt: new Date() },
            },
        });
        if (otpRecord) {
            await this.prisma.otpCode.update({
                where: { id: otpRecord.id },
                data: { isUsed: true },
            });
            return true;
        }
        return false;
    }
    async sendPromotionalSms(phoneNumbers, message) {
        const results = await Promise.all(phoneNumbers.map(phone => this.sendSms(phone, message, 'PROMOTIONAL')));
        const successful = results.filter(r => r).length;
        return {
            total: phoneNumbers.length,
            successful,
            failed: phoneNumbers.length - successful,
        };
    }
    async sendWishlistAlert(phoneNumber, productName) {
        const message = `Good news! ${productName} is back in stock. Order now: https://householdplanet.co.ke`;
        return this.sendSms(phoneNumber, message, 'WISHLIST_ALERT');
    }
    async sendDeliveryReminder(phoneNumber, orderNumber, deliveryDate) {
        const message = `Reminder: Your order #${orderNumber} is scheduled for delivery on ${deliveryDate}. Please be available.`;
        return this.sendSms(phoneNumber, message, 'DELIVERY_REMINDER');
    }
    async processWishlistAlerts() {
        try {
            const wishlistItems = await this.prisma.wishlist.findMany({
                where: {
                    product: {
                        stock: { gt: 0 },
                        isActive: true,
                    },
                },
                include: {
                    user: true,
                    product: true,
                },
            });
            for (const item of wishlistItems) {
                if (item.user.phoneNumber) {
                    await this.sendWishlistAlert(item.user.phoneNumber, item.product.name);
                }
            }
            this.logger.log(`Processed ${wishlistItems.length} wishlist alerts`);
        }
        catch (error) {
            this.logger.error('Failed to process wishlist alerts:', error);
        }
    }
    async processDeliveryReminders() {
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const nextDay = new Date(tomorrow);
            nextDay.setDate(nextDay.getDate() + 1);
            const deliveries = await this.prisma.order.findMany({
                where: {
                    status: 'OUT_FOR_DELIVERY',
                    estimatedDeliveryDate: {
                        gte: tomorrow,
                        lt: nextDay,
                    },
                },
                include: { user: true },
            });
            for (const order of deliveries) {
                if (order.user?.phoneNumber) {
                    await this.sendDeliveryReminder(order.user.phoneNumber, order.orderNumber, tomorrow.toLocaleDateString());
                }
            }
            this.logger.log(`Sent ${deliveries.length} delivery reminders`);
        }
        catch (error) {
            this.logger.error('Failed to process delivery reminders:', error);
        }
    }
    async generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    formatPhoneNumber(phoneNumber) {
        let cleaned = phoneNumber.replace(/\D/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '254' + cleaned.substring(1);
        }
        else if (!cleaned.startsWith('254')) {
            cleaned = '254' + cleaned;
        }
        return '+' + cleaned;
    }
    async logSms(phoneNumber, message, type, status, error) {
        try {
            await this.prisma.smsLog.create({
                data: {
                    phoneNumber,
                    message,
                    type,
                    status,
                    error,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to log SMS:', error);
        }
    }
    async getSmsStats() {
        const [total, sent, failed] = await Promise.all([
            this.prisma.smsLog.count(),
            this.prisma.smsLog.count({ where: { status: 'SENT' } }),
            this.prisma.smsLog.count({ where: { status: 'FAILED' } }),
        ]);
        return {
            total,
            sent,
            failed,
            deliveryRate: total > 0 ? (sent / total) * 100 : 0,
        };
    }
};
exports.SmsService = SmsService;
__decorate([
    (0, schedule_1.Cron)('0 9 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SmsService.prototype, "processWishlistAlerts", null);
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SmsService.prototype, "processDeliveryReminders", null);
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SmsService);
//# sourceMappingURL=sms.service.js.map