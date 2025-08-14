import { PrismaService } from '../prisma/prisma.service';
export declare class SmsService {
    private prisma;
    private readonly logger;
    private readonly apiKey;
    private readonly username;
    private readonly baseUrl;
    constructor(prisma: PrismaService);
    sendSms(phoneNumber: string, message: string, type?: string): Promise<boolean>;
    sendOrderConfirmation(phoneNumber: string, orderNumber: string, total: number): Promise<boolean>;
    sendPaymentConfirmation(phoneNumber: string, orderNumber: string, amount: number, method: string): Promise<boolean>;
    sendShippingNotification(phoneNumber: string, orderNumber: string, trackingNumber?: string): Promise<boolean>;
    sendDeliveryNotification(phoneNumber: string, orderNumber: string, deliveryTime?: string): Promise<boolean>;
    sendOtp(phoneNumber: string, otp: string): Promise<boolean>;
    verifyOtp(phoneNumber: string, code: string): Promise<boolean>;
    sendPromotionalSms(phoneNumbers: string[], message: string): Promise<{
        total: number;
        successful: number;
        failed: number;
    }>;
    sendWishlistAlert(phoneNumber: string, productName: string): Promise<boolean>;
    sendDeliveryReminder(phoneNumber: string, orderNumber: string, deliveryDate: string): Promise<boolean>;
    processWishlistAlerts(): Promise<void>;
    processDeliveryReminders(): Promise<void>;
    generateOtp(): Promise<string>;
    private formatPhoneNumber;
    private logSms;
    getSmsStats(): Promise<{
        total: number;
        sent: number;
        failed: number;
        deliveryRate: number;
    }>;
}
