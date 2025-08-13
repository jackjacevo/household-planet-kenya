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
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_1 = require("stripe");
let StripeService = class StripeService {
    constructor(prisma) {
        this.prisma = prisma;
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-07-30.basil',
        });
    }
    async createPaymentIntent(amount, orderId) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: 'kes',
                metadata: { orderId }
            });
            await this.prisma.payment.create({
                data: {
                    orderId,
                    checkoutRequestId: paymentIntent.id,
                    amount,
                    phoneNumber: '',
                    status: 'PENDING',
                    paymentMethod: 'STRIPE'
                }
            });
            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to create payment intent');
        }
    }
    async confirmPayment(paymentIntentId) {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
        const payment = await this.prisma.payment.findFirst({
            where: { checkoutRequestId: paymentIntentId }
        });
        if (payment && paymentIntent.status === 'succeeded') {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'COMPLETED', mpesaReceiptNumber: paymentIntent.id }
            });
            await this.prisma.order.update({
                where: { id: payment.orderId },
                data: { paymentStatus: 'PAID', status: 'CONFIRMED' }
            });
        }
        return { status: paymentIntent.status };
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map