import { ChatService } from './chat.service';
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    createSession(body: {
        visitorId: string;
        userAgent?: string;
        ipAddress?: string;
    }): Promise<{
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
    sendMessage(body: {
        sessionId: string;
        message: string;
        isFromCustomer: boolean;
    }): Promise<{
        message: {
            id: string;
            createdAt: Date;
            userId: string | null;
            message: string;
            sessionId: string;
            timestamp: Date;
            content: string | null;
            sender: string;
            isFromCustomer: boolean;
        };
        autoResponse: any;
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
    saveOfflineMessage(body: {
        name: string;
        email: string;
        message: string;
    }): Promise<{
        name: string;
        email: string;
        id: string;
        createdAt: Date;
        message: string;
    }>;
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
    assignSession(sessionId: string, user: any): Promise<{
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
    sendStaffMessage(body: {
        sessionId: string;
        message: string;
    }, user: any): Promise<{
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
}
