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
exports.DataRetentionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
let DataRetentionService = class DataRetentionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async cleanupExpiredData() {
        await this.cleanupInactiveUsers();
        await this.cleanupOldLogs();
        await this.cleanupExpiredSessions();
        await this.cleanupOldConsents();
    }
    async cleanupInactiveUsers() {
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        const inactiveUsers = await this.prisma.user.findMany({
            where: {
                lastLoginAt: { lt: twoYearsAgo },
                orders: { none: {} },
                isActive: false,
            },
        });
        for (const user of inactiveUsers) {
            await this.anonymizeUser(user.id);
        }
    }
    async anonymizeUser(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                email: `deleted_${userId}@deleted.local`,
                firstName: 'Deleted',
                lastName: 'User',
                phone: null,
                dateOfBirth: null,
                isActive: false,
            },
        });
    }
    async cleanupOldLogs() {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        await this.prisma.auditLog.deleteMany({
            where: { timestamp: { lt: ninetyDaysAgo } },
        });
    }
    async cleanupExpiredSessions() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    }
    async cleanupOldConsents() {
        const threeYearsAgo = new Date();
        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
        await this.prisma.userConsent.deleteMany({
            where: { timestamp: { lt: threeYearsAgo } },
        });
    }
    async getRetentionPolicy() {
        return {
            userAccounts: {
                activeUsers: 'Retained while account is active',
                inactiveUsers: 'Anonymized after 2 years of inactivity',
                deletedAccounts: 'Permanently deleted after 30 days',
            },
            orderData: {
                completedOrders: 'Retained for 7 years (tax requirements)',
                cancelledOrders: 'Retained for 2 years',
            },
            logs: {
                auditLogs: 'Retained for 90 days',
                securityLogs: 'Retained for 1 year',
                accessLogs: 'Retained for 30 days',
            },
            consents: {
                cookieConsents: 'Retained for 2 years',
                marketingConsents: 'Retained for 3 years',
            },
            sessions: {
                activeSessions: 'Expired after 24 hours of inactivity',
                expiredSessions: 'Deleted after 7 days',
            },
        };
    }
};
exports.DataRetentionService = DataRetentionService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DataRetentionService.prototype, "cleanupExpiredData", null);
exports.DataRetentionService = DataRetentionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DataRetentionService);
//# sourceMappingURL=data-retention.service.js.map