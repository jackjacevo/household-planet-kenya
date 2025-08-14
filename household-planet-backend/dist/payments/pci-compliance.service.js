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
exports.PCIComplianceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = require("crypto");
let PCIComplianceService = class PCIComplianceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPaymentToken(paymentMethodId, userId) {
        const token = crypto.randomBytes(32).toString('hex');
        return this.prisma.paymentToken.create({
            data: {
                token,
                type: 'PAYMENT_METHOD',
                userId: userId.toString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });
    }
    async validatePaymentToken(token) {
        const paymentToken = await this.prisma.paymentToken.findFirst({
            where: {
                token,
                expiresAt: { gt: new Date() },
            },
        });
        if (!paymentToken) {
            throw new Error('Invalid or expired payment token');
        }
        return paymentToken;
    }
    maskCardNumber(cardNumber) {
        if (!cardNumber || cardNumber.length < 4)
            return '****';
        return `****-****-****-${cardNumber.slice(-4)}`;
    }
    async logPaymentEvent(event, details, userId) {
        await this.prisma.paymentAuditLog.create({
            data: {
                action: 'PAYMENT_EVENT',
                event,
                details: JSON.stringify(details),
                userId: userId ? userId.toString() : null,
            },
        });
    }
    validatePaymentData(paymentData) {
        const errors = [];
        const forbiddenFields = ['cardNumber', 'cvv', 'expiryDate', 'securityCode'];
        forbiddenFields.forEach(field => {
            if (paymentData[field]) {
                errors.push(`${field} cannot be stored - use payment tokens only`);
            }
        });
        if (!paymentData.paymentMethodId && !paymentData.token) {
            errors.push('Payment method ID or token required');
        }
        return { isValid: errors.length === 0, errors };
    }
    async cleanupExpiredTokens() {
        await this.prisma.paymentToken.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });
    }
    async generateComplianceReport() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const report = {
            period: '30 days',
            paymentTransactions: await this.prisma.payment.count({
                where: { createdAt: { gte: thirtyDaysAgo } },
            }),
            activeTokens: await this.prisma.paymentToken.count({
                where: { expiresAt: { gt: new Date() } },
            }),
            auditLogEntries: await this.prisma.paymentAuditLog.count({
                where: { createdAt: { gte: thirtyDaysAgo } },
            }),
            securityEvents: await this.prisma.paymentAuditLog.count({
                where: {
                    createdAt: { gte: thirtyDaysAgo },
                    event: { in: ['PAYMENT_FAILED', 'TOKEN_EXPIRED', 'INVALID_TOKEN'] },
                },
            }),
        };
        return report;
    }
};
exports.PCIComplianceService = PCIComplianceService;
exports.PCIComplianceService = PCIComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PCIComplianceService);
//# sourceMappingURL=pci-compliance.service.js.map