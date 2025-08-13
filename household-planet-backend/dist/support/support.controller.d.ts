import { SupportService } from './support.service';
export declare class SupportController {
    private supportService;
    constructor(supportService: SupportService);
    createTicket(userId: string, data: {
        subject: string;
        message: string;
        category: string;
        priority?: string;
        orderId?: string;
    }): Promise<{
        replies: {
            id: string;
            createdAt: Date;
            message: string;
            ticketId: string;
            isStaff: boolean;
        }[];
    } & {
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        message: string;
        status: string;
        orderId: string | null;
        subject: string;
        priority: string;
    }>;
    getUserTickets(userId: string): Promise<({
        replies: {
            id: string;
            createdAt: Date;
            message: string;
            ticketId: string;
            isStaff: boolean;
        }[];
    } & {
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        message: string;
        status: string;
        orderId: string | null;
        subject: string;
        priority: string;
    })[]>;
    getTicket(userId: string, ticketId: string): Promise<{
        replies: {
            id: string;
            createdAt: Date;
            message: string;
            ticketId: string;
            isStaff: boolean;
        }[];
    } & {
        category: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        message: string;
        status: string;
        orderId: string | null;
        subject: string;
        priority: string;
    }>;
    addReply(userId: string, ticketId: string, data: {
        message: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        ticketId: string;
        isStaff: boolean;
    }>;
}
