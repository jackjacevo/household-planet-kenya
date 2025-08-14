import { AbTestingService } from './ab-testing.service';
import { ExperimentService } from './experiment.service';
export declare class AbTestingController {
    private abTestingService;
    private experimentService;
    constructor(abTestingService: AbTestingService, experimentService: ExperimentService);
    getExperimentConfig(type: string, userId?: string, sessionId?: string): Promise<{
        experimentId: string;
        variant: string;
    }>;
    trackConversion(data: {
        experimentId: string;
        userId?: string;
        sessionId?: string;
        eventType: string;
        eventValue?: number;
        metadata?: any;
    }): Promise<{
        event: string;
        id: string;
        userId: string | null;
        variant: string;
        value: number | null;
        experimentId: string;
        convertedAt: Date;
    }>;
    trackPurchase(data: {
        experimentId: string;
        userId?: string;
        sessionId?: string;
        orderValue?: number;
    }): Promise<{
        event: string;
        id: string;
        userId: string | null;
        variant: string;
        value: number | null;
        experimentId: string;
        convertedAt: Date;
    }>;
    trackAddToCart(data: {
        experimentId: string;
        userId?: string;
        sessionId?: string;
        productPrice?: number;
    }): Promise<{
        event: string;
        id: string;
        userId: string | null;
        variant: string;
        value: number | null;
        experimentId: string;
        convertedAt: Date;
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
    createExperiment(data: any): Promise<{
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
    createButtonColorExperiment(): Promise<{
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
    createCheckoutLayoutExperiment(): Promise<{
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
    createPricingDisplayExperiment(): Promise<{
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
    createProductPageLayoutExperiment(): Promise<{
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
    createContentExperiment(): Promise<{
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
    getRecommendations(experimentId: string): Promise<{
        status: string;
        message: string;
        recommendations: string[];
        conversionRate?: undefined;
    } | {
        status: string;
        conversionRate: number;
        message: string;
        recommendations: string[];
    }>;
    updateExperimentStatus(experimentId: string, data: {
        status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
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
}
