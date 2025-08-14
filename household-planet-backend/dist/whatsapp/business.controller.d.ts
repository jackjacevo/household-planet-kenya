import { WhatsAppBusinessService } from './business.service';
export declare class WhatsAppBusinessController {
    private businessService;
    constructor(businessService: WhatsAppBusinessService);
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
    }): Promise<{
        success: boolean;
    }>;
    getBusinessHours(): Promise<any>;
    getBusinessStatus(): Promise<{
        isOpen: boolean;
    }>;
    setAutoReply(body: {
        type: 'business_hours' | 'after_hours' | 'welcome';
        message: string;
    }): Promise<{
        success: boolean;
    }>;
    getAutoReply(type: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        type: string;
    }>;
    createSegment(body: {
        name: string;
        criteria: {
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
        };
    }): Promise<{
        name: string;
        id: string;
        description: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        criteria: string;
    }>;
    getSegmentCustomers(segmentId: string): Promise<{
        name: string;
        email: string;
        id: string;
        phoneNumber: string;
        _count: {
            orders: number;
        };
    }[]>;
    createCampaign(body: {
        name: string;
        message: string;
        segmentId?: string;
        phoneNumbers?: string[];
        scheduledAt?: string;
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
    addContact(body: {
        phoneNumber: string;
        name?: string;
        userId?: string;
    }): Promise<{
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
        success: boolean;
    }>;
    optInContact(phoneNumber: string): Promise<{
        success: boolean;
    }>;
    getContacts(): Promise<({
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
    getBusinessAnalytics(startDate?: string, endDate?: string): Promise<{
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
    sendWelcomeMessage(body: {
        phoneNumber: string;
        customerName?: string;
    }): Promise<{
        success: boolean;
    }>;
    sendOrderUpdate(body: {
        orderId: string;
        status: string;
        customMessage?: string;
    }): Promise<{
        success: boolean;
    }>;
    sendBulkWelcomeMessages(body: {
        contacts: Array<{
            phoneNumber: string;
            name?: string;
        }>;
    }): Promise<{
        total: number;
        successful: number;
        failed: number;
    }>;
    bulkOptOut(body: {
        phoneNumbers: string[];
    }): Promise<{
        total: number;
        successful: number;
        failed: number;
    }>;
    sendTemplateMessage(body: {
        templateName: string;
        phoneNumbers: string[];
        variables: Record<string, any>;
    }): Promise<{
        message: string;
        recipients: number;
    }>;
    getPerformanceMetrics(days?: string): Promise<{
        trends: {
            messageGrowth: number;
            contactGrowth: number;
            engagementRate: number;
        };
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
        period: string;
    }>;
    exportContacts(): Promise<{
        data: ({
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
        })[];
        exportedAt: Date;
        totalContacts: number;
    }>;
    exportAnalytics(startDate?: string, endDate?: string): Promise<{
        period: {
            start: Date;
            end: Date;
        };
        data: {
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
        };
        exportedAt: Date;
    }>;
}
