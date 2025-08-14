import { PrismaService } from '../prisma/prisma.service';
export declare class EmailService {
    private prisma;
    private readonly logger;
    private transporter;
    constructor(prisma: PrismaService);
    sendEmail(to: string, subject: string, html: string, templateData?: any): Promise<any>;
    sendWelcomeEmail(userEmail: string, userName: string): Promise<any>;
    sendOrderConfirmation(userEmail: string, orderData: any): Promise<any>;
    sendAbandonedCartEmail(userEmail: string, cartData: any, sequence?: number): Promise<any>;
    sendShippingNotification(userEmail: string, orderData: any): Promise<any>;
    sendDeliveryConfirmation(userEmail: string, orderData: any): Promise<any>;
    sendReviewReminder(userEmail: string, orderData: any): Promise<any>;
    sendBirthdayOffer(userEmail: string, userData: any): Promise<any>;
    sendNewsletter(userEmail: string, newsletterData: any): Promise<any>;
    processAbandonedCarts(): Promise<void>;
    processBirthdayOffers(): Promise<void>;
    private getTemplate;
    private renderTemplate;
    private logEmail;
}
