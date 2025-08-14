import { PrismaService } from '../prisma/prisma.service';
export declare class DataRetentionService {
    private prisma;
    constructor(prisma: PrismaService);
    cleanupExpiredData(): Promise<void>;
    private cleanupInactiveUsers;
    private anonymizeUser;
    private cleanupOldLogs;
    private cleanupExpiredSessions;
    private cleanupOldConsents;
    getRetentionPolicy(): Promise<{
        userAccounts: {
            activeUsers: string;
            inactiveUsers: string;
            deletedAccounts: string;
        };
        orderData: {
            completedOrders: string;
            cancelledOrders: string;
        };
        logs: {
            auditLogs: string;
            securityLogs: string;
            accessLogs: string;
        };
        consents: {
            cookieConsents: string;
            marketingConsents: string;
        };
        sessions: {
            activeSessions: string;
            expiredSessions: string;
        };
    }>;
}
