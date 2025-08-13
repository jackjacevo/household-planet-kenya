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
exports.PartialPaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PartialPaymentService = class PartialPaymentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPartialPaymentPlan(orderId, installments) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.BadRequestException('Order not found');
        const installmentAmount = Math.ceil(order.total / installments);
        const plan = [];
        for (let i = 0; i < installments; i++) {
            const amount = i === installments - 1
                ? order.total - (installmentAmount * (installments - 1))
                : installmentAmount;
            plan.push({
                orderId,
                installmentNumber: i + 1,
                amount,
                dueDate: new Date(Date.now() + (i * 30 * 24 * 60 * 60 * 1000)),
                status: i === 0 ? 'DUE' : 'PENDING'
            });
        }
        await this.prisma.partialPayment.createMany({ data: plan });
        return { message: 'Payment plan created', installments: plan.length };
    }
    async processPartialPayment(installmentId, paymentData) {
        const installment = await this.prisma.partialPayment.findUnique({
            where: { id: installmentId },
            include: { order: true }
        });
        if (!installment || installment.status !== 'DUE') {
            throw new common_1.BadRequestException('Invalid installment');
        }
        await this.prisma.payment.create({
            data: {
                orderId: installment.orderId,
                checkoutRequestId: `PARTIAL-${installmentId}-${Date.now()}`,
                amount: installment.amount,
                phoneNumber: paymentData.phoneNumber || '',
                status: 'COMPLETED',
                paymentMethod: paymentData.method
            }
        });
        await this.prisma.partialPayment.update({
            where: { id: installmentId },
            data: { status: 'PAID', paidAt: new Date() }
        });
        const remainingInstallments = await this.prisma.partialPayment.count({
            where: { orderId: installment.orderId, status: { not: 'PAID' } }
        });
        if (remainingInstallments === 0) {
            await this.prisma.order.update({
                where: { id: installment.orderId },
                data: { paymentStatus: 'PAID' }
            });
        }
        await this.prisma.partialPayment.updateMany({
            where: {
                orderId: installment.orderId,
                installmentNumber: installment.installmentNumber + 1
            },
            data: { status: 'DUE' }
        });
        return { message: 'Partial payment processed' };
    }
    async getPaymentPlan(orderId) {
        return this.prisma.partialPayment.findMany({
            where: { orderId },
            orderBy: { installmentNumber: 'asc' }
        });
    }
};
exports.PartialPaymentService = PartialPaymentService;
exports.PartialPaymentService = PartialPaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PartialPaymentService);
//# sourceMappingURL=partial-payment.service.js.map