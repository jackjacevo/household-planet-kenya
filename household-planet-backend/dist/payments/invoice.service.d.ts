import { PrismaService } from '../prisma/prisma.service';
export declare class InvoiceService {
    private prisma;
    constructor(prisma: PrismaService);
    generateInvoice(orderId: string): Promise<string>;
    emailInvoice(orderId: string, email: string): Promise<{
        message: string;
        path: string;
    }>;
}
