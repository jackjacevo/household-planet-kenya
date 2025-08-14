import { DeliveryService } from './delivery.service';
import { TrackingService } from './tracking.service';
import { SchedulingService } from './scheduling.service';
import { FeedbackService } from './feedback.service';
export declare class DeliveryController {
    private deliveryService;
    private trackingService;
    private schedulingService;
    private feedbackService;
    constructor(deliveryService: DeliveryService, trackingService: TrackingService, schedulingService: SchedulingService, feedbackService: FeedbackService);
    initializeLocations(): Promise<{
        message: string;
    }>;
    getAllLocations(): Promise<{
        name: string;
        id: string;
        description: string | null;
        price: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        estimatedDays: number;
        expressPrice: number | null;
        tier: number;
        expressAvailable: boolean;
    }[]>;
    getDeliveryPrice(location: string): Promise<{
        location: string;
        price: number;
    }>;
    getLocationsByTier(tier: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        price: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        estimatedDays: number;
        expressPrice: number | null;
        tier: number;
        expressAvailable: boolean;
    }[]>;
    getDeliveryEstimate(location: string): Promise<{
        standardPrice: number;
        estimatedDays: number;
        expressAvailable: boolean;
        expressPrice: number;
    }>;
    getTracking(orderId: string): Promise<{
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
    }>;
    updateTracking(orderId: string, data: {
        status: string;
        location?: string;
        notes?: string;
    }): Promise<{
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
    }>;
    confirmDelivery(orderId: string, data: {
        photoProof?: string;
    }): Promise<{
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
    }>;
    scheduleDelivery(orderId: string, data: {
        preferredDate: string;
        timeSlot: string;
        instructions?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        orderId: string;
        preferredDate: Date;
        timeSlot: string;
        instructions: string | null;
        isRescheduled: boolean;
    }>;
    submitFeedback(orderId: string, data: {
        rating: number;
        comment?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        orderId: string;
        rating: number;
        comment: string | null;
    }>;
    getFeedbackStats(): Promise<{
        rating: number;
        count: number;
    }[]>;
}
