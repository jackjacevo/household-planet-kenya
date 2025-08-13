import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardOverview(): Promise<{
        todaysSales: {
            revenue: number;
            count: number;
        };
        pendingOrders: number;
        lowStockProducts: number;
        totalCustomers: number;
        monthlyRevenue: number;
        totalOrders: number;
        averageOrderValue: number;
        conversionRate: number;
    }>;
    private getTodaysSales;
    private getPendingOrders;
    private getLowStockProducts;
    private getTotalCustomers;
    private getMonthlyRevenue;
    private getTotalOrders;
    private getAverageOrderValue;
    private getConversionRate;
    getSystemAlerts(): Promise<{
        lowStock: {
            name: string;
            id: string;
            stock: number;
            lowStockThreshold: number;
        }[];
        failedPayments: number;
        pendingReturns: number;
    }>;
    private getLowStockAlerts;
    private getFailedPayments;
    private getPendingReturns;
    getRecentActivities(limit: number): Promise<{
        type: string;
        message: string;
        timestamp: Date;
    }[]>;
}
