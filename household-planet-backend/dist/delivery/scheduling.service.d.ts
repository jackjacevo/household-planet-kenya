import { PrismaService } from '../prisma/prisma.service';
export declare class SchedulingService {
    private prisma;
    constructor(prisma: PrismaService);
    private timeSlots;
    scheduleDelivery(orderId: string, preferredDate: Date, timeSlot: string, instructions?: string): Promise<{
        id: string;
        createdAt: Date;
        orderId: string;
        preferredDate: Date;
        timeSlot: string;
        instructions: string | null;
        isRescheduled: boolean;
    }>;
    rescheduleDelivery(orderId: string, newDate: Date, newTimeSlot: string): Promise<{
        id: string;
        createdAt: Date;
        orderId: string;
        preferredDate: Date;
        timeSlot: string;
        instructions: string | null;
        isRescheduled: boolean;
    }>;
    getAvailableSlots(date: Date): Promise<string[]>;
    getSchedule(orderId: string): Promise<{
        id: string;
        createdAt: Date;
        orderId: string;
        preferredDate: Date;
        timeSlot: string;
        instructions: string | null;
        isRescheduled: boolean;
    }>;
}
