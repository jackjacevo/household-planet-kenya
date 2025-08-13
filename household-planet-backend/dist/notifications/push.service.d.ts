import { PrismaService } from '../prisma/prisma.service';
export declare class PushService {
    private prisma;
    constructor(prisma: PrismaService);
    subscribe(userId: string, subscription: any): Promise<{
        success: boolean;
    }>;
    sendNotification(userId: string, payload: {
        title: string;
        body: string;
        icon?: string;
        url?: string;
    }): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    sendOrderUpdate(userId: string, orderId: string, status: string): Promise<void>;
    sendAbandonedCartReminder(userId: string): Promise<void>;
    sendPromotion(userId: string, title: string, message: string, url?: string): Promise<void>;
}
