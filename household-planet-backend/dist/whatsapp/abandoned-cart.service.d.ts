import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from './whatsapp.service';
export declare class AbandonedCartService {
    private prisma;
    private whatsappService;
    private readonly logger;
    constructor(prisma: PrismaService, whatsappService: WhatsAppService);
    trackAbandonedCart(userId?: string | number, sessionId?: string, phoneNumber?: string, cartItems?: any[]): Promise<void>;
    markCartAsRecovered(userId?: string | number, sessionId?: string, phoneNumber?: string): Promise<void>;
    sendAbandonedCartReminders(): Promise<void>;
    getAbandonedCartStats(): Promise<{
        total: number;
        recovered: number;
        withReminders: number;
        recoveryRate: number;
    }>;
}
