import { PushService } from './push.service';
export declare class PushController {
    private pushService;
    constructor(pushService: PushService);
    subscribe(user: any, subscription: any): Promise<{
        success: boolean;
    }>;
    unsubscribe(body: {
        endpoint: string;
    }): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    testNotification(user: any): Promise<{
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
    broadcastNotification(user: any, payload: {
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
    sendOrderUpdate(user: any, body: {
        userId: string;
        orderId: string;
        status: string;
    }): Promise<void | {
        success: boolean;
        error: string;
    }>;
    sendAbandonedCartReminder(user: any, body: {
        userId: string;
        cartItems?: number;
    }): Promise<void | {
        success: boolean;
        error: string;
    }>;
    sendPromotion(user: any, body: {
        userId?: string;
        title: string;
        message: string;
        url?: string;
    }): Promise<void | {
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
    getVapidKey(): {
        publicKey: string;
    };
}
