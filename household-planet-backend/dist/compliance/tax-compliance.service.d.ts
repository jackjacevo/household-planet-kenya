import { PrismaService } from '../prisma/prisma.service';
export declare class TaxComplianceService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly vatRate;
    private readonly vatExemptCategories;
    calculateVAT(productId: string, amount: number): Promise<{
        baseAmount: number;
        vatAmount: number;
        totalAmount: number;
        vatRate: number;
        isExempt: boolean;
    }>;
    generateVATReport(startDate: Date, endDate: Date): Promise<{
        period: {
            startDate: Date;
            endDate: Date;
        };
        totalSales: number;
        exemptSales: number;
        taxableSales: number;
        totalVAT: number;
        vatRate: number;
        orderCount: number;
    }>;
    recordTaxTransaction(orderId: string, taxDetails: any): Promise<{
        id: string;
        orderId: string;
        baseAmount: number;
        vatAmount: number;
        totalAmount: number;
        vatRate: number;
        isExempt: boolean;
        recordedAt: Date;
    }>;
    getBusinessRegistrationInfo(): {
        businessName: string;
        kraPin: string;
        vatNumber: string;
        businessPermit: string;
        tradingLicense: string;
        address: {
            physical: string;
            postal: string;
        };
        contact: {
            phone: string;
            email: string;
        };
        registrationDate: string;
        renewalDate: string;
    };
}
