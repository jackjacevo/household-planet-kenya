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
exports.AbTestingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AbTestingService = class AbTestingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createExperiment(data) {
        return this.prisma.aBExperiment.create({
            data,
        });
    }
    async getActiveExperiments() {
        return this.prisma.aBExperiment.findMany({
            where: {
                status: 'ACTIVE',
            },
        });
    }
    async assignUserToVariant(experimentId, userId, sessionId) {
        const experiment = await this.prisma.aBExperiment.findUnique({
            where: { id: experimentId },
        });
        if (!experiment || experiment.status !== 'ACTIVE') {
            return null;
        }
        const existingAssignment = await this.prisma.aBAssignment.findFirst({
            where: {
                experimentId,
                userId,
            },
        });
        if (existingAssignment) {
            return {
                experimentId,
                variant: existingAssignment.variant,
            };
        }
        const variant = Math.random() < 0.5 ? 'A' : 'B';
        await this.prisma.aBAssignment.create({
            data: {
                experimentId,
                userId,
                variant,
            },
        });
        return {
            experimentId,
            variant,
        };
    }
    async trackConversion(data) {
        return this.prisma.aBConversion.create({
            data: {
                experimentId: data.experimentId,
                userId: data.userId,
                variant: 'A',
                event: data.event,
                value: data.value,
            },
        });
    }
    async getExperimentResults(experimentId) {
        const experiment = await this.prisma.aBExperiment.findUnique({
            where: { id: experimentId },
        });
        if (!experiment) {
            throw new Error('Experiment not found');
        }
        const assignments = await this.prisma.aBAssignment.count({
            where: { experimentId },
        });
        const conversions = await this.prisma.aBConversion.count({
            where: { experimentId },
        });
        return {
            experiment,
            assignments,
            conversions,
            conversionRate: assignments > 0 ? (conversions / assignments) * 100 : 0,
        };
    }
    determineWinner(results) {
        if (results.length < 2)
            return null;
        const sortedByConversionRate = [...results].sort((a, b) => b.conversionRate - a.conversionRate);
        const winner = sortedByConversionRate[0];
        const runner = sortedByConversionRate[1];
        const isSignificant = winner.participants >= 100 &&
            winner.conversionRate > runner.conversionRate * 1.1;
        return {
            variantName: winner.variantName,
            conversionRate: winner.conversionRate,
            isStatisticallySignificant: isSignificant,
            improvement: runner.conversionRate > 0
                ? ((winner.conversionRate - runner.conversionRate) / runner.conversionRate) * 100
                : 0,
        };
    }
    async updateExperimentStatus(experimentId, status) {
        return this.prisma.aBExperiment.update({
            where: { id: experimentId },
            data: { status },
        });
    }
    async getAllExperiments() {
        return this.prisma.aBExperiment.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.AbTestingService = AbTestingService;
exports.AbTestingService = AbTestingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AbTestingService);
//# sourceMappingURL=ab-testing.service.js.map