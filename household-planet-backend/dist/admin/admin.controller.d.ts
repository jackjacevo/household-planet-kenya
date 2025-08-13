import { AdminService } from './admin.service';
import { AnalyticsService } from './analytics.service';
export declare class AdminController {
    private adminService;
    private analyticsService;
    constructor(adminService: AdminService, analyticsService: AnalyticsService);
    getDashboard(): Promise<{
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
    getSalesAnalytics(period?: string): Promise<{
        dailySales: {
            date: string;
            revenue: number;
            orders: number;
        }[];
        weeklySales: unknown;
        monthlySales: unknown;
        topProducts: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.OrderItemGroupByOutputType, "productId"[]> & {
            _sum: {
                quantity: number;
                total: number;
            };
        })[];
    }>;
    getCustomerAnalytics(): Promise<{
        newCustomers: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.UserGroupByOutputType, "createdAt"[]> & {
            _count: number;
        })[];
        retentionRate: number;
        topCustomers: {
            name: string;
            email: string;
            id: string;
            loyaltyPoints: number;
            totalSpent: number;
            _count: {
                orders: number;
            };
        }[];
        customersByLocation: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.AddressGroupByOutputType, "county"[]> & {
            _count: {
                county: number;
            };
        })[];
    }>;
    getProductAnalytics(): Promise<{
        mostViewed: {
            name: string;
            id: string;
            price: number;
            viewCount: number;
        }[];
        bestRated: {
            name: string;
            id: string;
            price: number;
            averageRating: number;
            totalReviews: number;
        }[];
        categoryPerformance: {
            name: string;
            id: string;
            _count: {
                products: number;
            };
            products: {
                viewCount: number;
            }[];
        }[];
        inventoryStatus: {
            total: number;
            lowStock: number;
            outOfStock: number;
            inStock: number;
        };
    }>;
    getGeographicAnalytics(): Promise<{
        salesByCounty: unknown;
        deliveryPerformance: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.OrderGroupByOutputType, "deliveryLocation"[]> & {
            _count: {
                deliveryLocation: number;
            };
            _avg: {
                deliveryPrice: number;
            };
        })[];
        popularLocations: {
            name: string;
            id: string;
            price: number;
            tier: number;
        }[];
    }>;
    getAlerts(): Promise<{
        lowStock: {
            name: string;
            id: string;
            stock: number;
            lowStockThreshold: number;
        }[];
        failedPayments: number;
        pendingReturns: number;
    }>;
    getRecentActivities(limit?: string): Promise<{
        type: string;
        message: string;
        timestamp: Date;
    }[]>;
    getKPIs(): Promise<{
        revenue: {
            current: number;
            change: number;
        };
        orders: {
            current: number;
            change: number;
        };
        customers: {
            current: number;
            change: number;
        };
        conversion: {
            current: number;
            change: number;
        };
        retention: {
            current: number;
            change: number;
        };
        avgOrder: {
            current: number;
            change: number;
        };
    }>;
}
