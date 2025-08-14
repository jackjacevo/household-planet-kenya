import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class WhatsAppService implements OnModuleInit {
    private prisma;
    private readonly logger;
    private client;
    private isReady;
    private qrCode;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private initializeWhatsApp;
    getQRCode(): string;
    isClientReady(): boolean;
    sendMessage(phoneNumber: string, message: string, type: string, orderId?: string, userId?: string | number, mediaUrl?: string): Promise<boolean>;
    sendOrderConfirmation(phoneNumber: string, orderNumber: string, total: number, orderId: string, userId?: string | number): Promise<boolean>;
    sendDeliveryUpdate(phoneNumber: string, orderNumber: string, status: string, location?: string, orderId?: string, userId?: string | number): Promise<boolean>;
    sendAbandonedCartReminder(phoneNumber: string, cartItems: any[], userId?: string | number): Promise<boolean>;
    sendPromotionalMessage(phoneNumber: string, title: string, description: string, link?: string, userId?: string | number): Promise<boolean>;
    sendSupportMessage(phoneNumber: string, ticketId: string, response: string, userId?: string | number): Promise<boolean>;
    private formatPhoneNumber;
    private logMessage;
    getMessageHistory(phoneNumber?: string, userId?: string | number, limit?: number): Promise<({
        user: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        phoneNumber: string;
        message: string;
        type: string;
        status: string;
        orderId: string | null;
        templateId: string | null;
        mediaUrl: string | null;
        failureReason: string | null;
        sentAt: Date | null;
        deliveredAt: Date | null;
    })[]>;
    getMessageStats(): Promise<{
        total: number;
        sent: number;
        failed: number;
        pending: number;
    }>;
}
