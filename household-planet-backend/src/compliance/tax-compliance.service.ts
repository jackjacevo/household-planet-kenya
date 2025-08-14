import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaxComplianceService {
  constructor(private prisma: PrismaService) {}

  private readonly vatRate = 0.16; // 16% VAT in Kenya
  private readonly vatExemptCategories = ['basic-food', 'medical', 'educational'];

  async calculateVAT(productId: string, amount: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    const isVatExempt = this.vatExemptCategories.includes(product?.category?.name?.toLowerCase() || '');

    if (isVatExempt) {
      return {
        baseAmount: amount,
        vatAmount: 0,
        totalAmount: amount,
        vatRate: 0,
        isExempt: true,
      };
    }

    const vatAmount = amount * this.vatRate;
    return {
      baseAmount: amount,
      vatAmount: Math.round(vatAmount * 100) / 100,
      totalAmount: Math.round((amount + vatAmount) * 100) / 100,
      vatRate: this.vatRate,
      isExempt: false,
    };
  }

  async generateVATReport(startDate: Date, endDate: Date) {
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'COMPLETED',
      },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
    });

    let totalSales = 0;
    let totalVAT = 0;
    let exemptSales = 0;

    for (const order of orders) {
      for (const item of order.items) {
        const itemTotal = item.quantity * item.price;
        const vatCalc = await this.calculateVAT(item.productId, itemTotal);
        
        totalSales += vatCalc.baseAmount;
        totalVAT += vatCalc.vatAmount;
        
        if (vatCalc.isExempt) {
          exemptSales += vatCalc.baseAmount;
        }
      }
    }

    return {
      period: { startDate, endDate },
      totalSales: Math.round(totalSales * 100) / 100,
      exemptSales: Math.round(exemptSales * 100) / 100,
      taxableSales: Math.round((totalSales - exemptSales) * 100) / 100,
      totalVAT: Math.round(totalVAT * 100) / 100,
      vatRate: this.vatRate,
      orderCount: orders.length,
    };
  }

  async recordTaxTransaction(orderId: string, taxDetails: any) {
    return this.prisma.taxRecord.create({
      data: {
        orderId,
        baseAmount: taxDetails.baseAmount,
        vatAmount: taxDetails.vatAmount,
        totalAmount: taxDetails.totalAmount,
        vatRate: taxDetails.vatRate,
        isExempt: taxDetails.isExempt,
        recordedAt: new Date(),
      },
    });
  }

  getBusinessRegistrationInfo() {
    return {
      businessName: 'Household Planet Kenya Ltd',
      kraPin: 'P051234567X', // Example KRA PIN
      vatNumber: 'VAT123456789', // Example VAT number
      businessPermit: 'BP/2024/001234',
      tradingLicense: 'TL/NBI/2024/5678',
      address: {
        physical: 'Nairobi, Kenya',
        postal: 'P.O. Box 12345-00100, Nairobi',
      },
      contact: {
        phone: '+254700123456',
        email: 'info@householdplanet.co.ke',
      },
      registrationDate: '2024-01-01',
      renewalDate: '2025-01-01',
    };
  }
}