import { PrismaService } from '../prisma/prisma.service';
export declare class AgeVerificationService {
    private prisma;
    constructor(prisma: PrismaService);
    verifyAge(userId: number, dateOfBirth: Date, documentType?: string, documentNumber?: string): Promise<{
        isVerified: boolean;
        age: number;
    }>;
    checkProductAgeRestriction(productId: number, userId: number): Promise<{
        allowed: boolean;
        reason?: undefined;
    } | {
        allowed: boolean;
        reason: string;
    }>;
    private calculateAge;
    private hashDocument;
}
