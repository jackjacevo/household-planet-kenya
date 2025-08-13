import { PrismaService } from '../prisma/prisma.service';
export declare class FeedbackService {
    private prisma;
    constructor(prisma: PrismaService);
    submitFeedback(orderId: string, rating: number, comment?: string): Promise<{
        id: string;
        createdAt: Date;
        orderId: string;
        rating: number;
        comment: string | null;
    }>;
    getFeedback(orderId: string): Promise<{
        id: string;
        createdAt: Date;
        orderId: string;
        rating: number;
        comment: string | null;
    }>;
    getAverageRating(): Promise<{
        averageRating: number;
        totalFeedbacks: number;
    }>;
    getFeedbackStats(): Promise<{
        rating: number;
        count: number;
    }[]>;
}
