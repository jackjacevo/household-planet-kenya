import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentManagementService {
    private prisma;
    constructor(prisma: PrismaService);
    processCashOnDelivery(orderId: string): Promise<{
        message: string;
    }>;
    confirmCODPayment(orderId: string): Promise<{
        message: string;
    }>;
    processBankTransfer(orderId: string, bankDetails: any): Promise<{
        message: string;
        bankDetails: {
            accountName: string;
            accountNumber: string;
            bank: string;
            branch: string;
        };
    }>;
    verifyBankTransfer(orderId: string, referenceNumber: string): Promise<{
        message: string;
    }>;
    processRefund(paymentId: string, amount: number, reason: string): Promise<{
        message: string;
    }>;
    getPaymentDashboard(): Promise<{
        summary: {
            totalPayments: number;
            pendingPayments: number;
            completedPayments: number;
            refunds: number;
        };
        paymentsByMethod: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PaymentGroupByOutputType, "paymentMethod"[]> & {
            _count: {
                id: number;
            };
            _sum: {
                amount: number;
            };
        })[];
    }>;
    getTransactionHistory(page?: number, limit?: number): Promise<{
        payments: ({
            order: {
                userId: string;
                orderNumber: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phoneNumber: string;
            status: string;
            orderId: string;
            failureReason: string | null;
            paymentMethod: string;
            checkoutRequestId: string;
            merchantRequestId: string | null;
            amount: number;
            mpesaReceiptNumber: string | null;
            transactionDate: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
}
