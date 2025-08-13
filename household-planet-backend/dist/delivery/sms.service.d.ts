export declare class SmsService {
    private apiKey;
    private username;
    sendSms(phoneNumber: string, message: string): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendOrderConfirmation(phoneNumber: string, orderNumber: string): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendDeliveryUpdate(phoneNumber: string, orderNumber: string, status: string): Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendDeliveryConfirmation(phoneNumber: string, orderNumber: string): Promise<{
        success: boolean;
        messageId: string;
    }>;
}
