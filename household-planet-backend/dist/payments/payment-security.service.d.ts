import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentSecurityService {
    private prisma;
    constructor(prisma: PrismaService);
    generatePaymentToken(orderId: string, amount: number): string;
    validatePaymentToken(token: string, orderId: string, amount: number): boolean;
    encryptCardData(cardData: string): string;
    decryptCardData(encryptedData: string): string;
    maskCardNumber(cardNumber: string): string;
    validatePaymentAmount(orderId: string, amount: number): Promise<boolean>;
    logSecurityEvent(event: string, details: any): void;
    createSecurePaymentSession(orderId: string, paymentMethod: string): Promise<{
        sessionId: `${string}-${string}-${string}-${string}-${string}`;
        expiresAt: Date;
    }>;
    validatePaymentSession(sessionId: string): Promise<boolean>;
}
