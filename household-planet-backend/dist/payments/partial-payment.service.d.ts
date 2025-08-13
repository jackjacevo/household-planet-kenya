import { PrismaService } from '../prisma/prisma.service';
export declare class PartialPaymentService {
    private prisma;
    constructor(prisma: PrismaService);
    createPartialPaymentPlan(orderId: string, installments: number): Promise<{
        message: string;
        installments: number;
    }>;
    processPartialPayment(installmentId: string, paymentData: any): Promise<{
        message: string;
    }>;
    getPaymentPlan(orderId: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        orderId: string;
        amount: number;
        installmentNumber: number;
        dueDate: Date;
        paidAt: Date | null;
    }[]>;
}
