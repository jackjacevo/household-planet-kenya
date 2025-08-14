import { PrismaService } from '../prisma/prisma.service';
export declare class SecurityTrainingService {
    private prisma;
    constructor(prisma: PrismaService);
    getTrainingModules(): Promise<({
        id: number;
        title: string;
        description: string;
        duration: string;
        mandatory: boolean;
        topics: string[];
        quiz: {
            question: string;
            options: string[];
            correct: number;
        }[];
    } | {
        id: number;
        title: string;
        description: string;
        duration: string;
        mandatory: boolean;
        topics: string[];
        quiz?: undefined;
    })[]>;
    recordTrainingCompletion(userId: string, moduleId: string, score?: number): Promise<{
        id: string;
        userId: string;
        completedAt: Date;
        moduleId: string;
        score: number | null;
    }>;
    getTrainingStatus(userId: string): Promise<{
        totalModules: number;
        mandatoryModules: number;
        completedModules: number;
        completedMandatory: number;
        isCompliant: boolean;
        completions: {
            id: string;
            userId: string;
            completedAt: Date;
            moduleId: string;
            score: number | null;
        }[];
        nextDueDate: Date;
    }>;
    generateTrainingReport(startDate?: Date, endDate?: Date): Promise<{
        period: {
            startDate: Date;
            endDate: Date;
        };
        totalCompletions: number;
        averageScore: number;
        completionsByModule: unknown[];
        complianceRate: number;
        topPerformers: {
            userId: number;
            email: any;
            averageScore: number;
            completions: any;
        }[];
        needsAttention: {
            email: string;
            role: string;
            id: string;
        }[];
    }>;
    scheduleTrainingReminders(): Promise<void>;
    createCustomTraining(trainingData: any): Promise<{
        id: number;
        title: any;
        description: any;
        duration: any;
        mandatory: any;
        topics: any;
        quiz: any;
        createdAt: Date;
    }>;
    private checkComplianceStatus;
    private calculateNextDueDate;
    private calculateAverageScore;
    private groupCompletionsByModule;
    private calculateComplianceRate;
    private getTopPerformers;
    private getUsersNeedingTraining;
    private sendTrainingReminder;
    private sendRefresherReminder;
}
