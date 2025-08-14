import { PrismaService } from '../prisma/prisma.service';
export declare class PCIComplianceService {
    private prisma;
    constructor(prisma: PrismaService);
    createPaymentToken(paymentMethodId: string, userId: number): Promise<{
        token: string;
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        expiresAt: Date;
    }>;
    validatePaymentToken(token: string): Promise<{
        token: string;
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        expiresAt: Date;
    }>;
    maskCardNumber(cardNumber: string): string;
    logPaymentEvent(event: string, details: any, userId?: number): Promise<void>;
    validatePaymentData(paymentData: any): {
        isValid: boolean;
        errors: any[];
    };
    cleanupExpiredTokens(): Promise<void>;
    generateComplianceReport(): Promise<{
        period: string;
        paymentTransactions: number;
        activeTokens: number;
        auditLogEntries: number;
        securityEvents: number;
    }>;
}
