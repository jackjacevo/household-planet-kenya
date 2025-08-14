import { PrismaService } from '../prisma/prisma.service';
export declare class AbTestingService {
    private prisma;
    constructor(prisma: PrismaService);
    createExperiment(data: {
        name: string;
        description: string;
    }): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
    }>;
    getActiveExperiments(): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
    }[]>;
    assignUserToVariant(experimentId: string, userId?: string, sessionId?: string): Promise<{
        experimentId: string;
        variant: string;
    }>;
    trackConversion(data: {
        experimentId: string;
        userId?: string;
        event: string;
        value?: number;
    }): Promise<{
        event: string;
        id: string;
        userId: string | null;
        variant: string;
        value: number | null;
        experimentId: string;
        convertedAt: Date;
    }>;
    getExperimentResults(experimentId: string): Promise<{
        experiment: {
            name: string;
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            status: string;
            startDate: Date | null;
            endDate: Date | null;
        };
        assignments: number;
        conversions: number;
        conversionRate: number;
    }>;
    private determineWinner;
    updateExperimentStatus(experimentId: string, status: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
    }>;
    getAllExperiments(): Promise<{
        name: string;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
    }[]>;
}
