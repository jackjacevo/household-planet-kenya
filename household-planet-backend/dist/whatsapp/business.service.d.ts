import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppTemplateService } from './template.service';
export declare class WhatsAppBusinessService {
    private prisma;
    private whatsappService;
    private templateService;
    private readonly logger;
    constructor(prisma: PrismaService, whatsappService: WhatsAppService, templateService: WhatsAppTemplateService);
    setBusinessHours(hours: {
        monday: {
            open: string;
            close: string;
            isOpen: boolean;
        };
        tuesday: {
            open: string;
            close: string;
            isOpen: boolean;
        };
        wednesday: {
            open: string;
            close: string;
            isOpen: boolean;
        };
        thursday: {
            open: string;
            close: string;
            isOpen: boolean;
        };
        friday: {
            open: string;
            close: string;
            isOpen: boolean;
        };
        saturday: {
            open: string;
            close: string;
            isOpen: boolean;
        };
        sunday: {
            open: string;
            close: string;
            isOpen: boolean;
        };
    }): Promise<void>;
    getBusinessHours(): Promise<any>;
    isBusinessOpen(): Promise<boolean>;
    setAutoReply(type: 'business_hours' | 'after_hours' | 'welcome', message: string): Promise<void>;
    getAutoReply(type: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        type: string;
    }>;
    sendAutoReply(phoneNumber: string, type: string): Promise<boolean>;
    createCustomerSegment(name: string, criteria: {
        totalOrders?: {
            min?: number;
            max?: number;
        };
        totalSpent?: {
            min?: number;
            max?: number;
        };
        lastOrderDays?: number;
        location?: string[];
        hasWhatsApp?: boolean;
    }): Promise<{
        name: string;
        id: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        criteria: string;
    }>;
    getCustomersInSegment(segmentId: string): Promise<{
        name: string;
        email: string;
        id: string;
        phoneNumber: string;
        _count: {
            orders: number;
        };
    }[]>;
    createBroadcastCampaign(data: {
        name: string;
        message: string;
        segmentId?: string;
        phoneNumbers?: string[];
        scheduledAt?: Date;
        mediaUrl?: string;
    }): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        status: string;
        mediaUrl: string | null;
        sentAt: Date | null;
        phoneNumbers: string | null;
        scheduledAt: Date | null;
        completedAt: Date | null;
        totalSent: number;
        totalDelivered: number;
        totalFailed: number;
        totalRecipients: number;
        successfulSends: number;
        failedSends: number;
        segmentId: string | null;
    }>;
    executeCampaign(campaignId: string): Promise<{
        successCount: number;
        failureCount: number;
        total: number;
    }>;
    addContact(phoneNumber: string, name?: string, userId?: string): Promise<{
        name: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        optedOutAt: Date | null;
        phoneNumber: string;
        isOptedIn: boolean;
        lastMessageAt: Date | null;
    }>;
    optOutContact(phoneNumber: string): Promise<{
        name: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        optedOutAt: Date | null;
        phoneNumber: string;
        isOptedIn: boolean;
        lastMessageAt: Date | null;
    }>;
    optInContact(phoneNumber: string): Promise<{
        name: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        optedOutAt: Date | null;
        phoneNumber: string;
        isOptedIn: boolean;
        lastMessageAt: Date | null;
    }>;
    getOptedInContacts(): Promise<({
        user: {
            name: string;
            email: string;
            id: string;
        };
    } & {
        name: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        optedOutAt: Date | null;
        phoneNumber: string;
        isOptedIn: boolean;
        lastMessageAt: Date | null;
    })[]>;
    getCampaignAnalytics(campaignId: string): Promise<{
        campaign: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            message: string;
            status: string;
            mediaUrl: string | null;
            sentAt: Date | null;
            phoneNumbers: string | null;
            scheduledAt: Date | null;
            completedAt: Date | null;
            totalSent: number;
            totalDelivered: number;
            totalFailed: number;
            totalRecipients: number;
            successfulSends: number;
            failedSends: number;
            segmentId: string | null;
        };
        totalSent: number;
        totalFailed: number;
        deliveryRate: number;
    }>;
    getBusinessAnalytics(startDate: Date, endDate: Date): Promise<{
        messages: {
            total: number;
            sent: number;
            failed: number;
            deliveryRate: number;
        };
        campaigns: number;
        contacts: {
            total: number;
            optedIn: number;
            optedOut: number;
            optInRate: number;
        };
    }>;
    sendWelcomeMessage(phoneNumber: string, customerName?: string): Promise<boolean>;
    sendOrderStatusUpdate(orderId: string, status: string, customMessage?: string): Promise<boolean>;
}
