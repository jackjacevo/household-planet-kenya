import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentAnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getPaymentAnalytics(startDate: Date, endDate: Date): Promise<{
        summary: {
            totalRevenue: number;
            totalTransactions: number;
            avgTransactionValue: number;
            failureRate: number;
        };
        paymentsByMethod: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PaymentGroupByOutputType, "paymentMethod"[]> & {
            _count: {
                id: number;
            };
            _sum: {
                amount: number;
            };
        })[];
        dailyRevenue: unknown;
        period: {
            startDate: Date;
            endDate: Date;
        };
    }>;
    getTopCustomers(limit?: number): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PaymentGroupByOutputType, "orderId"[]> & {
        _count: {
            id: number;
        };
        _sum: {
            amount: number;
        };
    })[]>;
    getRefundAnalytics(): Promise<{
        totalRefunds: import(".prisma/client").Prisma.GetRefundAggregateType<{
            _sum: {
                amount: true;
            };
            _count: {
                id: true;
            };
        }>;
        refundsByReason: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.RefundGroupByOutputType, "reason"[]> & {
            _count: {
                id: number;
            };
            _sum: {
                amount: number;
            };
        })[];
    }>;
}
