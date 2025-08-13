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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const nodemailer = require("nodemailer");
const axios_1 = require("axios");
let NotificationService = class NotificationService {
    constructor(prisma) {
        this.prisma = prisma;
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    async sendPaymentConfirmationEmail(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true, payments: true }
        });
        if (!order)
            return;
        const payment = order.payments.find(p => p.status === 'COMPLETED');
        if (!payment)
            return;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: order.user.email,
            subject: `Payment Confirmation - Order ${order.orderNumber}`,
            html: `
        <h2>Payment Confirmed</h2>
        <p>Dear ${order.user.name},</p>
        <p>Your payment of KES ${payment.amount} for order ${order.orderNumber} has been confirmed.</p>
        <p>Payment Method: ${payment.paymentMethod}</p>
        <p>Transaction ID: ${payment.mpesaReceiptNumber || payment.checkoutRequestId}</p>
        <p>Thank you for shopping with Household Planet Kenya!</p>
      `
        };
        try {
            await this.transporter.sendMail(mailOptions);
            return { message: 'Email sent successfully' };
        }
        catch (error) {
            console.error('Email sending failed:', error);
            return { message: 'Email sending failed' };
        }
    }
    async sendPaymentConfirmationSMS(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true, payments: true }
        });
        if (!order?.user.phone)
            return;
        const payment = order.payments.find(p => p.status === 'COMPLETED');
        if (!payment)
            return;
        const message = `Payment confirmed! KES ${payment.amount} for order ${order.orderNumber}. Thank you for shopping with Household Planet Kenya.`;
        try {
            await axios_1.default.post('https://api.africastalking.com/version1/messaging', {
                username: process.env.SMS_USERNAME,
                to: order.user.phone,
                message
            }, {
                headers: { 'apiKey': process.env.SMS_API_KEY }
            });
            return { message: 'SMS sent successfully' };
        }
        catch (error) {
            console.error('SMS sending failed:', error);
            return { message: 'SMS sending failed' };
        }
    }
    async sendPaymentFailureNotification(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true }
        });
        if (!order)
            return;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: order.user.email,
            subject: `Payment Failed - Order ${order.orderNumber}`,
            html: `
        <h2>Payment Failed</h2>
        <p>Dear ${order.user.name},</p>
        <p>Your payment for order ${order.orderNumber} could not be processed.</p>
        <p>Please try again or contact our support team.</p>
        <p><a href="${process.env.BASE_URL}/orders/${order.id}/retry">Retry Payment</a></p>
      `
        };
        await this.transporter.sendMail(mailOptions);
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map