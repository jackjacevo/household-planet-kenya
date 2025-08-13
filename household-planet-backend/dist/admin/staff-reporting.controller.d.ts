import { StaffManagementService } from './staff-management.service';
import { ReportingService } from './reporting.service';
export declare class StaffReportingController {
    private staffManagementService;
    private reportingService;
    constructor(staffManagementService: StaffManagementService, reportingService: ReportingService);
    getStaffMembers(): Promise<{
        name: string;
        email: string;
        role: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        lastLoginAt: Date;
    }[]>;
    createStaffMember(data: any, user: any): Promise<{
        name: string;
        email: string;
        phone: string | null;
        password: string;
        role: string;
        dateOfBirth: Date | null;
        gender: string | null;
        id: string;
        avatar: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        firstName: string | null;
        lastName: string | null;
        emailVerified: boolean;
        phoneVerified: boolean;
        emailVerifyToken: string | null;
        phoneVerifyToken: string | null;
        resetPasswordToken: string | null;
        resetPasswordExpires: Date | null;
        refreshToken: string | null;
        lastLoginAt: Date | null;
        socialProviders: string | null;
        twoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        loyaltyPoints: number;
        totalSpent: number;
        preferredLanguage: string;
        marketingEmails: boolean;
        smsNotifications: boolean;
    }>;
    updateStaffRole(id: string, data: {
        role: string;
    }, user: any): Promise<{
        name: string;
        email: string;
        phone: string | null;
        password: string;
        role: string;
        dateOfBirth: Date | null;
        gender: string | null;
        id: string;
        avatar: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        firstName: string | null;
        lastName: string | null;
        emailVerified: boolean;
        phoneVerified: boolean;
        emailVerifyToken: string | null;
        phoneVerifyToken: string | null;
        resetPasswordToken: string | null;
        resetPasswordExpires: Date | null;
        refreshToken: string | null;
        lastLoginAt: Date | null;
        socialProviders: string | null;
        twoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        loyaltyPoints: number;
        totalSpent: number;
        preferredLanguage: string;
        marketingEmails: boolean;
        smsNotifications: boolean;
    }>;
    deactivateStaff(id: string, user: any): Promise<{
        name: string;
        email: string;
        phone: string | null;
        password: string;
        role: string;
        dateOfBirth: Date | null;
        gender: string | null;
        id: string;
        avatar: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        firstName: string | null;
        lastName: string | null;
        emailVerified: boolean;
        phoneVerified: boolean;
        emailVerifyToken: string | null;
        phoneVerifyToken: string | null;
        resetPasswordToken: string | null;
        resetPasswordExpires: Date | null;
        refreshToken: string | null;
        lastLoginAt: Date | null;
        socialProviders: string | null;
        twoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        loyaltyPoints: number;
        totalSpent: number;
        preferredLanguage: string;
        marketingEmails: boolean;
        smsNotifications: boolean;
    }>;
    getStaffPermissions(role: string): Promise<any>;
    getActivityLog(filters: any): Promise<unknown>;
    logActivity(data: {
        action: string;
        details: any;
    }, user: any): Promise<number>;
    getSalesReport(startDate: string, endDate: string): Promise<{
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
    getCustomerReport(): Promise<{
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
    getInventoryReport(): Promise<{
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
    getFinancialReport(startDate: string, endDate: string): Promise<{
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
}
