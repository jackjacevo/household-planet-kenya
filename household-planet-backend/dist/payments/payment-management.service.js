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
exports.PaymentManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentManagementService = class PaymentManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processCashOnDelivery(orderId) {
        await this.prisma.payment.create({
            data: {
                orderId,
                checkoutRequestId: `COD-${orderId}-${Date.now()}`,
                amount: 0,
                phoneNumber: '',
                status: 'PENDING',
                paymentMethod: 'COD'
            }
        });
        await this.prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: 'COD_PENDING', status: 'CONFIRMED' }
        });
        return { message: 'Cash on delivery order confirmed' };
    }
    async confirmCODPayment(orderId) {
        const payment = await this.prisma.payment.findFirst({
            where: { orderId, paymentMethod: 'COD' }
        });
        if (payment) {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'COMPLETED' }
            });
            await this.prisma.order.update({
                where: { id: orderId },
                data: { paymentStatus: 'PAID', status: 'DELIVERED' }
            });
        }
        return { message: 'COD payment confirmed' };
    }
    async processBankTransfer(orderId, bankDetails) {
        await this.prisma.payment.create({
            data: {
                orderId,
                checkoutRequestId: `BT-${orderId}-${Date.now()}`,
                amount: bankDetails.amount,
                phoneNumber: '',
                status: 'PENDING_VERIFICATION',
                paymentMethod: 'BANK_TRANSFER'
            }
        });
        return {
            message: 'Bank transfer initiated. Please transfer to:',
            bankDetails: {
                accountName: 'Household Planet Kenya',
                accountNumber: '1234567890',
                bank: 'KCB Bank',
                branch: 'Nairobi'
            }
        };
    }
    async verifyBankTransfer(orderId, referenceNumber) {
        const payment = await this.prisma.payment.findFirst({
            where: { orderId, paymentMethod: 'BANK_TRANSFER' }
        });
        if (payment) {
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'COMPLETED', mpesaReceiptNumber: referenceNumber }
            });
            await this.prisma.order.update({
                where: { id: orderId },
                data: { paymentStatus: 'PAID', status: 'CONFIRMED' }
            });
        }
        return { message: 'Bank transfer verified' };
    }
    async processRefund(paymentId, amount, reason) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { order: true }
        });
        if (!payment) {
            throw new common_1.BadRequestException('Payment not found');
        }
        await this.prisma.refund.create({
            data: {
                paymentId,
                orderId: payment.orderId,
                amount,
                reason,
                status: 'PENDING'
            }
        });
        return { message: 'Refund initiated' };
    }
    async getPaymentDashboard() {
        const [totalPayments, pendingPayments, completedPayments, refunds] = await Promise.all([
            this.prisma.payment.count(),
            this.prisma.payment.count({ where: { status: 'PENDING' } }),
            this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
            this.prisma.refund.count()
        ]);
        const paymentsByMethod = await this.prisma.payment.groupBy({
            by: ['paymentMethod'],
            _count: { id: true },
            _sum: { amount: true }
        });
        return {
            summary: { totalPayments, pendingPayments, completedPayments, refunds },
            paymentsByMethod
        };
    }
    async getTransactionHistory(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                include: { order: { select: { orderNumber: true, userId: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.payment.count()
        ]);
        return {
            payments,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        };
    }
};
exports.PaymentManagementService = PaymentManagementService;
exports.PaymentManagementService = PaymentManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentManagementService);
//# sourceMappingURL=payment-management.service.js.map