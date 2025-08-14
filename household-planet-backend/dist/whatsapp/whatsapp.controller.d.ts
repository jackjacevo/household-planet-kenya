import { WhatsAppService } from './whatsapp.service';
import { AbandonedCartService } from './abandoned-cart.service';
import { WhatsAppTemplateService } from './template.service';
export declare class WhatsAppController {
    private whatsappService;
    private abandonedCartService;
    private templateService;
    constructor(whatsappService: WhatsAppService, abandonedCartService: AbandonedCartService, templateService: WhatsAppTemplateService);
    getStatus(): {
        isReady: boolean;
        qrCode: string;
    };
    getStats(): Promise<{
        messages: {
            total: number;
            sent: number;
            failed: number;
            pending: number;
        };
        abandonedCarts: {
            total: number;
            recovered: number;
            withReminders: number;
            recoveryRate: number;
        };
    }>;
    getMessages(phoneNumber?: string, userId?: string, limit?: string): Promise<({
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
    sendMessage(body: {
        phoneNumber: string;
        message: string;
        type?: string;
        userId?: string;
        mediaUrl?: string;
    }): Promise<{
        success: boolean;
    }>;
    sendPromotional(body: {
        phoneNumbers: string[];
        title: string;
        description: string;
        link?: string;
    }): Promise<{
        total: number;
        successful: number;
        failed: number;
    }>;
    trackAbandonedCart(body: {
        userId?: string;
        sessionId?: string;
        phoneNumber?: string;
        cartItems?: any[];
    }): Promise<{
        success: boolean;
    }>;
    markCartRecovered(body: {
        userId?: string;
        sessionId?: string;
        phoneNumber?: string;
    }): Promise<{
        success: boolean;
    }>;
    getTemplates(): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        template: string;
    }[]>;
    getTemplate(name: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        template: string;
    }>;
    createTemplate(body: {
        name: string;
        type: string;
        template: string;
    }): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        template: string;
    }>;
    updateTemplate(name: string, body: {
        template: string;
    }): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        template: string;
    }>;
    seedTemplates(): Promise<{
        success: boolean;
    }>;
    getContactInfo(): {
        whatsappNumber: string;
        message: string;
        link: string;
    };
    sendQuickInquiry(body: {
        phoneNumber: string;
        productName?: string;
        productUrl?: string;
        message?: string;
    }): Promise<{
        success: boolean;
    }>;
}
