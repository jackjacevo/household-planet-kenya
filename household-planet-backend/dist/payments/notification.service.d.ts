import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationService {
    private prisma;
    private transporter;
    constructor(prisma: PrismaService);
    sendPaymentConfirmationEmail(orderId: string): Promise<{
        message: string;
    }>;
    sendPaymentConfirmationSMS(orderId: string): Promise<{
        message: string;
    }>;
    sendPaymentFailureNotification(orderId: string): Promise<void>;
}
