import { PrismaService } from '../prisma/prisma.service';
export declare class ChatService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createChatSession(visitorId: string, userAgent?: string, ipAddress?: string): Promise<{
        id: string;
        userId: string | null;
        status: string;
        visitorId: string | null;
        userAgent: string | null;
        lastActivityAt: Date;
        assignedTo: string | null;
        closedAt: Date | null;
        startedAt: Date;
        endedAt: Date | null;
    }>;
    sendMessage(sessionId: string, message: string, isFromCustomer: boolean, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        message: string;
        sessionId: string;
        timestamp: Date;
        content: string | null;
        sender: string;
        isFromCustomer: boolean;
    }>;
    getChatHistory(sessionId: string): Promise<({
        user: {
            name: string;
            role: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        message: string;
        sessionId: string;
        timestamp: Date;
        content: string | null;
        sender: string;
        isFromCustomer: boolean;
    })[]>;
    getActiveSessions(): Promise<({
        _count: {
            messages: number;
        };
        messages: {
            id: string;
            createdAt: Date;
            userId: string | null;
            message: string;
            sessionId: string;
            timestamp: Date;
            content: string | null;
            sender: string;
            isFromCustomer: boolean;
        }[];
    } & {
        id: string;
        userId: string | null;
        status: string;
        visitorId: string | null;
        userAgent: string | null;
        lastActivityAt: Date;
        assignedTo: string | null;
        closedAt: Date | null;
        startedAt: Date;
        endedAt: Date | null;
    })[]>;
    assignSession(sessionId: string, userId: string): Promise<{
        id: string;
        userId: string | null;
        status: string;
        visitorId: string | null;
        userAgent: string | null;
        lastActivityAt: Date;
        assignedTo: string | null;
        closedAt: Date | null;
        startedAt: Date;
        endedAt: Date | null;
    }>;
    closeSession(sessionId: string): Promise<{
        id: string;
        userId: string | null;
        status: string;
        visitorId: string | null;
        userAgent: string | null;
        lastActivityAt: Date;
        assignedTo: string | null;
        closedAt: Date | null;
        startedAt: Date;
        endedAt: Date | null;
    }>;
    saveOfflineMessage(name: string, email: string, message: string): Promise<{
        name: string;
        email: string;
        id: string;
        createdAt: Date;
        message: string;
    }>;
    findAutoResponse(message: string): Promise<string>;
}
