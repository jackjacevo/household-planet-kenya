import { PrismaService } from '../prisma/prisma.service';
export declare class PushService {
    private prisma;
    constructor(prisma: PrismaService);
    subscribe(userId: string, subscription: any): Promise<{
        success: boolean;
    }>;
    unsubscribe(endpoint: string): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    getVapidPublicKey(): {
        publicKey: string;
    };
    sendNotification(userId: string, payload: {
        title: string;
        body: string;
        icon?: string;
        url?: string;
        tag?: string;
        requireInteraction?: boolean;
        actions?: Array<{
            action: string;
            title: string;
            icon?: string;
        }>;
    }): Promise<{
        success: boolean;
        sent: number;
        total: number;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        sent?: undefined;
        total?: undefined;
    }>;
    private removeInvalidSubscription;
    sendOrderUpdate(userId: string, orderId: string, status: string): Promise<void>;
    sendAbandonedCartReminder(userId: string, cartItems?: number): Promise<void>;
    sendPromotion(userId: string, title: string, message: string, url?: string): Promise<void>;
    sendWelcomeNotification(userId: string): Promise<void>;
    sendLowStockAlert(userId: string, productName: string, productId: string): Promise<void>;
    sendDeliveryUpdate(userId: string, orderId: string, message: string): Promise<void>;
    broadcastNotification(payload: {
        title: string;
        body: string;
        url?: string;
        userIds?: string[];
    }): Promise<{
        success: boolean;
        sent: number;
        total: any;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        sent?: undefined;
        total?: undefined;
    }>;
}
