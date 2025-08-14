import { PrismaService } from '../prisma/prisma.service';
export declare class ConsumerRightsService {
    private prisma;
    constructor(prisma: PrismaService);
    getConsumerRights(): {
        rightToInformation: {
            title: string;
            description: string;
            details: string[];
        };
        rightToChoose: {
            title: string;
            description: string;
            details: string[];
        };
        rightToSafety: {
            title: string;
            description: string;
            details: string[];
        };
        rightToRedress: {
            title: string;
            description: string;
            details: string[];
        };
        rightToPrivacy: {
            title: string;
            description: string;
            details: string[];
        };
    };
    recordConsumerComplaint(userId: number, complaintData: any): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        userId: string;
        type: string;
        status: string;
    }>;
    getReturnPolicy(): Promise<{
        returnPeriod: string;
        conditions: string[];
        process: string[];
        exceptions: string[];
        refundMethods: string[];
    }>;
    getWarrantyInfo(productId: number): Promise<{
        product: string;
        warrantyPeriod: string;
        warrantyType: string;
        terms: string | string[];
        claimProcess: string[];
    }>;
}
