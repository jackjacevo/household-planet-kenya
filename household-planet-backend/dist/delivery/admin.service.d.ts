import { PrismaService } from '../prisma/prisma.service';
export declare class AdminDeliveryService {
    private prisma;
    constructor(prisma: PrismaService);
    getDeliveryDashboard(): Promise<{
        totalOrders: number;
        pendingDeliveries: number;
        completedDeliveries: number;
        failedDeliveries: number;
        deliveryRate: string | number;
    }>;
    getDeliveryAnalytics(days?: number): Promise<{
        deliveriesByLocation: {
            location: string;
            count: number;
        }[];
        deliveriesByStatus: {
            status: string;
            count: number;
        }[];
        averageRating: number;
    }>;
    getFailedDeliveries(): Promise<({
        order: {
            user: {
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
                optedOutAt: Date | null;
                phoneNumber: string | null;
                privacySettings: string | null;
            };
        } & {
            deliveryLocation: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            status: string;
            total: number;
            orderNumber: string;
            subtotal: number;
            shippingCost: number;
            discount: number;
            shippingAddress: string;
            deliveryPrice: number;
            paymentMethod: string;
            paymentStatus: string;
            promoCodeId: string | null;
            guestEmail: string | null;
            guestName: string | null;
            guestPhone: string | null;
            estimatedDeliveryDate: Date | null;
        };
        updates: {
            id: string;
            status: string;
            notes: string | null;
            location: string | null;
            timestamp: Date;
            trackingId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        orderId: string;
        deliveredAt: Date | null;
        notes: string | null;
        location: string | null;
        photoProof: string | null;
    })[]>;
    bulkUpdateStatus(orderIds: string[], status: string, notes?: string): Promise<any[]>;
}
