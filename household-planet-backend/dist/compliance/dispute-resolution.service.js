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
exports.DisputeResolutionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DisputeResolutionService = class DisputeResolutionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async initiateDispute(userId, disputeData) {
        const dispute = await this.prisma.dispute.create({
            data: {
                userId: userId.toString(),
                type: disputeData.type,
                description: disputeData.description,
                status: 'OPEN',
                initiatedAt: new Date(),
            },
        });
        await this.assignDispute(dispute.id, disputeData.type);
        return dispute;
    }
    async getDisputeResolutionProcess() {
        return {
            steps: [
                {
                    step: 1,
                    title: 'Submit Dispute',
                    description: 'File your dispute with detailed information',
                    timeframe: 'Immediate',
                },
                {
                    step: 2,
                    title: 'Initial Review',
                    description: 'Our team reviews your dispute',
                    timeframe: '1-2 business days',
                },
                {
                    step: 3,
                    title: 'Investigation',
                    description: 'Thorough investigation of the issue',
                    timeframe: '3-5 business days',
                },
                {
                    step: 4,
                    title: 'Resolution Proposal',
                    description: 'We propose a resolution',
                    timeframe: '1-2 business days',
                },
                {
                    step: 5,
                    title: 'Final Resolution',
                    description: 'Implementation of agreed solution',
                    timeframe: '1-3 business days',
                },
            ],
            totalTimeframe: '7-14 business days',
            escalationOptions: [
                'Internal escalation to senior management',
                'External mediation through Consumer Federation of Kenya',
                'Legal action through small claims court',
            ],
        };
    }
    async updateDisputeStatus(disputeId, status, resolution) {
        return this.prisma.dispute.update({
            where: { id: disputeId.toString() },
            data: {
                status,
            },
        });
    }
    async getDisputeHistory(userId) {
        return this.prisma.dispute.findMany({
            where: { userId: userId.toString() },
            orderBy: { initiatedAt: 'desc' },
        });
    }
    async escalateDispute(disputeId, reason) {
        await this.prisma.dispute.update({
            where: { id: disputeId.toString() },
            data: {
                status: 'ESCALATED',
                escalationReason: reason,
            },
        });
        await this.notifyEscalation(disputeId);
    }
    calculatePriority(disputeData) {
        if (disputeData.amount > 10000)
            return 'HIGH';
        if (disputeData.type === 'SAFETY_CONCERN')
            return 'HIGH';
        if (disputeData.type === 'FRAUD')
            return 'HIGH';
        return 'MEDIUM';
    }
    calculateResolutionDate(disputeType) {
        const baseDays = disputeType === 'REFUND' ? 7 : 14;
        return new Date(Date.now() + baseDays * 24 * 60 * 60 * 1000);
    }
    async assignDispute(disputeId, disputeType) {
        const department = this.getDepartmentForDispute(disputeType);
        await this.prisma.dispute.update({
            where: { id: disputeId },
            data: { assignedDepartment: department },
        });
    }
    getDepartmentForDispute(disputeType) {
        const departmentMap = {
            'REFUND': 'FINANCE',
            'PRODUCT_QUALITY': 'QUALITY_ASSURANCE',
            'DELIVERY': 'LOGISTICS',
            'FRAUD': 'SECURITY',
            'BILLING': 'FINANCE',
            'TECHNICAL': 'TECHNICAL_SUPPORT',
        };
        return departmentMap[disputeType] || 'CUSTOMER_SERVICE';
    }
    async notifyEscalation(disputeId) {
        console.log(`Dispute ${disputeId} escalated to senior management`);
    }
};
exports.DisputeResolutionService = DisputeResolutionService;
exports.DisputeResolutionService = DisputeResolutionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DisputeResolutionService);
//# sourceMappingURL=dispute-resolution.service.js.map