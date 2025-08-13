import { PrismaService } from '../prisma/prisma.service';
export declare class ReportingService {
    private prisma;
    constructor(prisma: PrismaService);
    generateSalesReport(startDate: Date, endDate: Date): Promise<{
        period: {
            startDate: Date;
            endDate: Date;
        };
        summary: import(".prisma/client").Prisma.GetOrderAggregateType<{
            _sum: {
                total: true;
            };
            _count: true;
            _avg: {
                total: true;
            };
            where: {
                createdAt: {
                    gte: Date;
                    lte: Date;
                };
                status: {
                    not: string;
                };
            };
        }>;
        topProducts: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.OrderItemGroupByOutputType, "productId"[]> & {
            _sum: {
                quantity: number;
                total: number;
            };
        })[];
        salesByLocation: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.OrderGroupByOutputType, "deliveryLocation"[]> & {
            _count: number;
            _sum: {
                total: number;
            };
        })[];
        generatedAt: Date;
    }>;
    generateCustomerReport(): Promise<{
        customerStats: {
            total: number;
            active: number;
            new30Days: number;
        };
        topCustomers: {
            name: string;
            email: string;
            id: string;
            totalSpent: number;
            _count: {
                orders: number;
            };
        }[];
        customerGrowth: unknown;
        retention: {
            total: number;
            returning: number;
            rate: number;
        };
        generatedAt: Date;
    }>;
    generateInventoryReport(): Promise<{
        stockLevels: import(".prisma/client").Prisma.GetProductAggregateType<{
            _sum: {
                stock: true;
            };
            _count: true;
            where: {
                isActive: true;
            };
        }>;
        lowStock: {
            name: string;
            id: string;
            stock: number;
            lowStockThreshold: number;
        }[];
        topSelling: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.OrderItemGroupByOutputType, "productId"[]> & {
            _sum: {
                quantity: number;
            };
        })[];
        slowMoving: {
            name: string;
            id: string;
            stock: number;
            createdAt: Date;
        }[];
        generatedAt: Date;
    }>;
    generateFinancialReport(startDate: Date, endDate: Date): Promise<{
        period: {
            startDate: Date;
            endDate: Date;
        };
        revenue: import(".prisma/client").Prisma.GetOrderAggregateType<{
            _sum: {
                total: true;
            };
            where: {
                createdAt: {
                    gte: Date;
                    lte: Date;
                };
                status: {
                    not: string;
                };
            };
        }>;
        expenses: {
            shipping: number;
        };
        profit: {
            revenue: number;
            expenses: number;
            profit: number;
            margin: number;
        };
        paymentMethods: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PaymentGroupByOutputType, "paymentMethod"[]> & {
            _count: number;
            _sum: {
                amount: number;
            };
        })[];
        generatedAt: Date;
    }>;
    private getSalesData;
    private getTopProducts;
    private getSalesByLocation;
    private getCustomerStats;
    private getTopCustomers;
    private getCustomerGrowth;
    private getCustomerRetention;
    private getStockLevels;
    private getLowStockItems;
    private getTopSellingProducts;
    private getSlowMovingProducts;
    private getRevenue;
    private getExpenses;
    private getProfit;
    private getPaymentMethodBreakdown;
}
