import { SmsService } from './sms.service';
export declare class SmsController {
    private smsService;
    constructor(smsService: SmsService);
    sendOtp(body: {
        phoneNumber: string;
    }): Promise<{
        success: boolean;
    }>;
    verifyOtp(body: {
        phoneNumber: string;
        code: string;
    }): Promise<{
        isValid: boolean;
    }>;
    sendSms(body: {
        phoneNumber: string;
        message: string;
        type?: string;
    }): Promise<{
        success: boolean;
    }>;
    sendPromotional(body: {
        phoneNumbers: string[];
        message: string;
    }): Promise<{
        total: number;
        successful: number;
        failed: number;
    }>;
    sendOrderConfirmation(body: {
        phoneNumber: string;
        orderNumber: string;
        total: number;
    }): Promise<{
        success: boolean;
    }>;
    sendPaymentConfirmation(body: {
        phoneNumber: string;
        orderNumber: string;
        amount: number;
        method: string;
    }): Promise<{
        success: boolean;
    }>;
    sendShippingNotification(body: {
        phoneNumber: string;
        orderNumber: string;
        trackingNumber?: string;
    }): Promise<{
        success: boolean;
    }>;
    sendDeliveryNotification(body: {
        phoneNumber: string;
        orderNumber: string;
        deliveryTime?: string;
    }): Promise<{
        success: boolean;
    }>;
    sendWishlistAlert(body: {
        phoneNumber: string;
        productName: string;
    }): Promise<{
        success: boolean;
    }>;
    getSmsStats(): Promise<{
        total: number;
        sent: number;
        failed: number;
        deliveryRate: number;
    }>;
}
