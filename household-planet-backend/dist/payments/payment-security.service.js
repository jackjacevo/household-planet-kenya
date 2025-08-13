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
exports.PaymentSecurityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = require("crypto");
let PaymentSecurityService = class PaymentSecurityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generatePaymentToken(orderId, amount) {
        const data = `${orderId}-${amount}-${Date.now()}`;
        return crypto.createHash('sha256').update(data + process.env.JWT_SECRET).digest('hex');
    }
    validatePaymentToken(token, orderId, amount) {
        const expectedToken = this.generatePaymentToken(orderId, amount);
        return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
    }
    encryptCardData(cardData) {
        const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY || 'default-key');
        let encrypted = cipher.update(cardData, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }
    decryptCardData(encryptedData) {
        const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY || 'default-key');
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    maskCardNumber(cardNumber) {
        return cardNumber.replace(/\d(?=\d{4})/g, '*');
    }
    validatePaymentAmount(orderId, amount) {
        return this.prisma.order.findUnique({
            where: { id: orderId }
        }).then(order => order?.total === amount);
    }
    logSecurityEvent(event, details) {
        console.log(`[SECURITY] ${event}:`, details);
    }
    async createSecurePaymentSession(orderId, paymentMethod) {
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.paymentSession.create({
            data: {
                sessionId,
                orderId,
                paymentMethod,
                expiresAt,
                status: 'ACTIVE'
            }
        });
        return { sessionId, expiresAt };
    }
    async validatePaymentSession(sessionId) {
        const session = await this.prisma.paymentSession.findUnique({
            where: { sessionId }
        });
        if (!session || session.status !== 'ACTIVE' || session.expiresAt < new Date()) {
            return false;
        }
        return true;
    }
};
exports.PaymentSecurityService = PaymentSecurityService;
exports.PaymentSecurityService = PaymentSecurityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentSecurityService);
//# sourceMappingURL=payment-security.service.js.map