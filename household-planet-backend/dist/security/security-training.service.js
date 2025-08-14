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
exports.SecurityTrainingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SecurityTrainingService = class SecurityTrainingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTrainingModules() {
        return [
            {
                id: 1,
                title: 'Password Security',
                description: 'Learn about creating and managing secure passwords',
                duration: '15 minutes',
                mandatory: true,
                topics: [
                    'Password complexity requirements',
                    'Two-factor authentication',
                    'Password managers',
                    'Common password attacks',
                ],
                quiz: [
                    {
                        question: 'What is the minimum recommended password length?',
                        options: ['6 characters', '8 characters', '12 characters', '16 characters'],
                        correct: 2,
                    },
                    {
                        question: 'Which of these is a strong password?',
                        options: ['password123', 'P@ssw0rd!2024', '12345678', 'admin'],
                        correct: 1,
                    },
                ],
            },
            {
                id: 2,
                title: 'Phishing Awareness',
                description: 'Identify and avoid phishing attacks',
                duration: '20 minutes',
                mandatory: true,
                topics: [
                    'Types of phishing attacks',
                    'Identifying suspicious emails',
                    'Safe link and attachment handling',
                    'Reporting procedures',
                ],
                quiz: [
                    {
                        question: 'What should you do if you receive a suspicious email?',
                        options: ['Click links to verify', 'Forward to colleagues', 'Report to IT security', 'Delete immediately'],
                        correct: 2,
                    },
                ],
            },
            {
                id: 3,
                title: 'Data Protection',
                description: 'Understand data handling and privacy requirements',
                duration: '25 minutes',
                mandatory: true,
                topics: [
                    'Data classification',
                    'GDPR compliance',
                    'Secure data storage',
                    'Data breach procedures',
                ],
            },
            {
                id: 4,
                title: 'Social Engineering',
                description: 'Recognize and defend against social engineering attacks',
                duration: '18 minutes',
                mandatory: false,
                topics: [
                    'Common social engineering tactics',
                    'Verification procedures',
                    'Information sharing policies',
                    'Physical security awareness',
                ],
            },
            {
                id: 5,
                title: 'Incident Response',
                description: 'Know how to respond to security incidents',
                duration: '22 minutes',
                mandatory: true,
                topics: [
                    'Incident identification',
                    'Reporting procedures',
                    'Containment actions',
                    'Recovery processes',
                ],
            },
        ];
    }
    async recordTrainingCompletion(userId, moduleId, score) {
        const completion = await this.prisma.securityTraining.create({
            data: {
                userId,
                moduleId,
                score,
            },
        });
        await this.checkComplianceStatus(userId);
        return completion;
    }
    async getTrainingStatus(userId) {
        const completions = await this.prisma.securityTraining.findMany({
            where: { userId },
            orderBy: { completedAt: 'desc' },
        });
        const modules = await this.getTrainingModules();
        const mandatoryModules = modules.filter(m => m.mandatory);
        const completedMandatory = completions.filter(c => mandatoryModules.some(m => m.id.toString() === c.moduleId));
        return {
            totalModules: modules.length,
            mandatoryModules: mandatoryModules.length,
            completedModules: completions.length,
            completedMandatory: completedMandatory.length,
            isCompliant: completedMandatory.length === mandatoryModules.length,
            completions,
            nextDueDate: this.calculateNextDueDate(completions),
        };
    }
    async generateTrainingReport(startDate, endDate) {
        const whereClause = {};
        if (startDate || endDate) {
            whereClause.completedAt = {};
            if (startDate)
                whereClause.completedAt.gte = startDate;
            if (endDate)
                whereClause.completedAt.lte = endDate;
        }
        const completions = await this.prisma.securityTraining.findMany({
            where: whereClause,
        });
        const modules = await this.getTrainingModules();
        return {
            period: { startDate, endDate },
            totalCompletions: completions.length,
            averageScore: this.calculateAverageScore(completions),
            completionsByModule: this.groupCompletionsByModule(completions, modules),
            complianceRate: this.calculateComplianceRate(completions, modules),
            topPerformers: this.getTopPerformers(completions),
            needsAttention: await this.getUsersNeedingTraining(),
        };
    }
    async scheduleTrainingReminders() {
        const users = await this.prisma.user.findMany({
            where: { isActive: true },
            select: { id: true, email: true },
        });
        for (const user of users) {
            const status = await this.getTrainingStatus(user.id);
            if (!status.isCompliant) {
                await this.sendTrainingReminder(user.id, user.email);
            }
            else if (status.nextDueDate && status.nextDueDate <= new Date()) {
                await this.sendRefresherReminder(user.id, user.email);
            }
        }
    }
    async createCustomTraining(trainingData) {
        return {
            id: Date.now(),
            title: trainingData.title,
            description: trainingData.description,
            duration: trainingData.duration,
            mandatory: trainingData.mandatory || false,
            topics: trainingData.topics || [],
            quiz: trainingData.quiz || [],
            createdAt: new Date(),
        };
    }
    async checkComplianceStatus(userId) {
        const status = await this.getTrainingStatus(userId);
        console.log(`User ${userId} training compliance: ${status.isCompliant}`);
    }
    calculateNextDueDate(completions) {
        if (completions.length === 0)
            return null;
        const latestCompletion = completions[0];
        const nextDue = new Date(latestCompletion.completedAt);
        nextDue.setFullYear(nextDue.getFullYear() + 1);
        return nextDue;
    }
    calculateAverageScore(completions) {
        const withScores = completions.filter(c => c.score !== null);
        if (withScores.length === 0)
            return 0;
        const total = withScores.reduce((sum, c) => sum + c.score, 0);
        return Math.round(total / withScores.length);
    }
    groupCompletionsByModule(completions, modules) {
        const moduleMap = modules.reduce((map, module) => {
            map[module.id] = { ...module, completions: 0, averageScore: 0 };
            return map;
        }, {});
        completions.forEach(completion => {
            if (moduleMap[completion.moduleId]) {
                moduleMap[completion.moduleId].completions++;
            }
        });
        return Object.values(moduleMap);
    }
    calculateComplianceRate(completions, modules) {
        const mandatoryModules = modules.filter(m => m.mandatory);
        const users = [...new Set(completions.map(c => c.userId))];
        if (users.length === 0)
            return 0;
        let compliantUsers = 0;
        users.forEach(userId => {
            const userCompletions = completions.filter(c => c.userId === userId);
            const completedMandatory = userCompletions.filter(c => mandatoryModules.some(m => m.id.toString() === c.moduleId));
            if (completedMandatory.length === mandatoryModules.length) {
                compliantUsers++;
            }
        });
        return Math.round((compliantUsers / users.length) * 100);
    }
    getTopPerformers(completions) {
        const userScores = {};
        completions.forEach(completion => {
            if (completion.score) {
                if (!userScores[completion.userId]) {
                    userScores[completion.userId] = { scores: [], user: completion.user };
                }
                userScores[completion.userId].scores.push(completion.score);
            }
        });
        const performers = Object.entries(userScores).map(([userId, data]) => ({
            userId: parseInt(userId),
            email: data.user.email,
            averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
            completions: data.scores.length,
        }));
        return performers
            .sort((a, b) => b.averageScore - a.averageScore)
            .slice(0, 5);
    }
    async getUsersNeedingTraining() {
        const users = await this.prisma.user.findMany({
            where: {
                isActive: true,
            },
            select: { id: true, email: true, role: true },
        });
        return users;
    }
    async sendTrainingReminder(userId, email) {
        console.log(`Sending training reminder to ${email}`);
    }
    async sendRefresherReminder(userId, email) {
        console.log(`Sending refresher training reminder to ${email}`);
    }
};
exports.SecurityTrainingService = SecurityTrainingService;
exports.SecurityTrainingService = SecurityTrainingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SecurityTrainingService);
//# sourceMappingURL=security-training.service.js.map