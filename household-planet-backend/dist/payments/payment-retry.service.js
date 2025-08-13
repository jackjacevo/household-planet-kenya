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
exports.PaymentRetryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mpesa_service_1 = require("./mpesa.service");
const stripe_service_1 = require("./stripe.service");
let PaymentRetryService = class PaymentRetryService {
    constructor(prisma, mpesaService, stripeService) {
        this.prisma = prisma;
        this.mpesaService = mpesaService;
        this.stripeService = stripeService;
    }
    async retryFailedPayment(paymentId) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { order: true }
        });
        if (!payment || payment.status !== 'FAILED')
            return;
        const retryCount = await this.prisma.paymentRetry.count({
            where: { paymentId }
        });
        if (retryCount >= 3) {
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: { status: 'RETRY_EXHAUSTED' }
            });
            return { message: 'Maximum retry attempts reached' };
        }
        await this.prisma.paymentRetry.create({
            data: { paymentId, attempt: retryCount + 1 }
        });
        try {
            let result;
            if (payment.paymentMethod === 'MPESA') {
                result = await this.mpesaService.initiateSTKPush(payment.phoneNumber, payment.amount, payment.orderId);
            }
            else if (payment.paymentMethod === 'STRIPE') {
                result = await this.stripeService.createPaymentIntent(payment.amount, payment.orderId);
            }
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: { status: 'PENDING' }
            });
            return { message: 'Payment retry initiated', result };
        }
        catch (error) {
            await this.prisma.payment.update({
                where: { id: paymentId },
                data: { status: 'FAILED', failureReason: error.message }
            });
            throw error;
        }
    }
    async scheduleAutoRetry(paymentId) {
        setTimeout(() => this.retryFailedPayment(paymentId), 300000);
    }
};
exports.PaymentRetryService = PaymentRetryService;
exports.PaymentRetryService = PaymentRetryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mpesa_service_1.MpesaService,
        stripe_service_1.StripeService])
], PaymentRetryService);
//# sourceMappingURL=payment-retry.service.js.map