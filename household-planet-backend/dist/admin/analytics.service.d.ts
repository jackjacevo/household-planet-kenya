import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSalesAnalytics(period: string): Promise<{
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
    private parsePeriod;
    private getDailySales;
    private getWeeklySales;
    private getMonthlySales;
    private getTopSellingProducts;
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
    private getNewCustomersOverTime;
    private getCustomerRetentionRate;
    private getTopCustomers;
    private getCustomersByLocation;
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
    private getMostViewedProducts;
    private getBestRatedProducts;
    private getCategoryPerformance;
    private getInventoryStatus;
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
    private getSalesByCounty;
    private getDeliveryPerformanceByLocation;
    private getPopularDeliveryLocations;
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
    private getRevenueKPI;
    private getOrdersKPI;
    private getCustomersKPI;
    private getConversionKPI;
    private getRetentionKPI;
    private getAverageOrderKPI;
}
