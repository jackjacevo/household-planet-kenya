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
exports.AgeVerificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AgeVerificationService = class AgeVerificationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async verifyAge(userId, dateOfBirth, documentType, documentNumber) {
        const age = this.calculateAge(dateOfBirth);
        const isVerified = age >= 18;
        await this.prisma.ageVerification.create({
            data: {
                userId: userId.toString(),
                method: documentType || 'DATE_OF_BIRTH',
                verified: isVerified,
                age,
            },
        });
        return { isVerified, age };
    }
    async checkProductAgeRestriction(productId, userId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId.toString() },
            select: { ageRestricted: true, minimumAge: true },
        });
        if (!product?.ageRestricted)
            return { allowed: true };
        const verification = await this.prisma.ageVerification.findFirst({
            where: { userId: userId.toString(), verified: true },
            orderBy: { verifiedAt: 'desc' },
        });
        if (!verification)
            return { allowed: false, reason: 'Age verification required' };
        const allowed = verification.age >= (product.minimumAge || 18);
        return {
            allowed,
            reason: allowed ? null : `Minimum age ${product.minimumAge} required`
        };
    }
    calculateAge(dateOfBirth) {
        const today = new Date();
        let age = today.getFullYear() - dateOfBirth.getFullYear();
        const monthDiff = today.getMonth() - dateOfBirth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
            age--;
        }
        return age;
    }
    hashDocument(documentNumber) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(documentNumber).digest('hex');
    }
};
exports.AgeVerificationService = AgeVerificationService;
exports.AgeVerificationService = AgeVerificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AgeVerificationService);
//# sourceMappingURL=age-verification.service.js.map