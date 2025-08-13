import { PrismaService } from '../prisma/prisma.service';
export declare class MpesaService {
    private prisma;
    private readonly logger;
    private readonly baseUrl;
    private readonly businessShortCode;
    private readonly passkey;
    constructor(prisma: PrismaService);
    private getAccessToken;
    private generatePassword;
    initiateSTKPush(phoneNumber: string, amount: number, orderId: string): Promise<{
        checkoutRequestId: any;
        responseCode: any;
        responseDescription: any;
    }>;
    handleCallback(callbackData: any): Promise<void>;
    checkPaymentStatus(checkoutRequestId: string): Promise<{
        status: string;
        amount: number;
        orderNumber: string;
        mpesaReceiptNumber: string;
    }>;
}
