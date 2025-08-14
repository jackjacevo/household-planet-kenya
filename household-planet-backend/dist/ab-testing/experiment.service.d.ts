import { AbTestingService } from './ab-testing.service';
export declare class ExperimentService {
    private abTestingService;
    constructor(abTestingService: AbTestingService);
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
    getExperimentConfig(experimentType: string, userId?: string, sessionId?: string): Promise<{
        experimentId: string;
        variant: string;
    }>;
    trackPurchase(experimentId: string, userId?: string, sessionId?: string, orderValue?: number): Promise<{
        event: string;
        id: string;
        userId: string | null;
        variant: string;
        value: number | null;
        experimentId: string;
        convertedAt: Date;
    }>;
    trackAddToCart(experimentId: string, userId?: string, sessionId?: string, productPrice?: number): Promise<{
        event: string;
        id: string;
        userId: string | null;
        variant: string;
        value: number | null;
        experimentId: string;
        convertedAt: Date;
    }>;
    trackSignup(experimentId: string, userId?: string, sessionId?: string): Promise<{
        event: string;
        id: string;
        userId: string | null;
        variant: string;
        value: number | null;
        experimentId: string;
        convertedAt: Date;
    }>;
    trackPageView(experimentId: string, userId?: string, sessionId?: string, page?: string): Promise<{
        event: string;
        id: string;
        userId: string | null;
        variant: string;
        value: number | null;
        experimentId: string;
        convertedAt: Date;
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
}
