import { PrismaService } from '../prisma/prisma.service';
export declare class FlutterwaveService {
    private prisma;
    private readonly baseUrl;
    constructor(prisma: PrismaService);
    initiatePayment(amount: number, email: string, phoneNumber: string, orderId: string): Promise<{
        paymentLink: any;
        txRef: string;
    }>;
    verifyPayment(txRef: string): Promise<{
        status: any;
    }>;
}
