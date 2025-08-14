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
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ComplianceService = class ComplianceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordConsent(userId, consentType, granted) {
        return this.prisma.userConsent.create({
            data: {
                userId: userId.toString(),
                type: consentType,
                granted,
                timestamp: new Date(),
            },
        });
    }
    async getUserConsents(userId) {
        return this.prisma.userConsent.findMany({
            where: { userId: userId.toString() },
            orderBy: { timestamp: 'desc' },
        });
    }
    async updatePrivacySettings(userId, settings) {
        return this.prisma.user.update({
            where: { id: userId.toString() },
            data: { privacySettings: settings },
        });
    }
    async requestDataDeletion(userId, reason) {
        await this.prisma.dataDeletionRequest.create({
            data: {
                userId: userId.toString(),
                reason,
                status: 'PENDING',
                requestedAt: new Date(),
            },
        });
        setTimeout(async () => {
            await this.executeDataDeletion(userId);
        }, 30 * 24 * 60 * 60 * 1000);
    }
    async executeDataDeletion(userId) {
        await this.prisma.$transaction([
            this.prisma.userConsent.deleteMany({ where: { userId: userId.toString() } }),
            this.prisma.order.deleteMany({ where: { userId: userId.toString() } }),
            this.prisma.cart.deleteMany({ where: { userId: userId.toString() } }),
            this.prisma.user.delete({ where: { id: userId.toString() } }),
        ]);
    }
    async logDataBreach(description, affectedUsers) {
        const breach = await this.prisma.dataBreach.create({
            data: {
                type: 'DATA_BREACH',
                severity: 'HIGH',
                description,
                affectedUsers: affectedUsers.length,
            },
        });
        this.scheduleBreachNotification(breach.id);
        return breach;
    }
    scheduleBreachNotification(breachId) {
        setTimeout(async () => {
            console.log(`Breach notification required for breach ${breachId}`);
        }, 72 * 60 * 60 * 1000);
    }
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ComplianceService);
//# sourceMappingURL=compliance.service.js.map