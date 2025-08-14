import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PCIComplianceService {
  constructor(private prisma: PrismaService) {}

  // Never store card details - only tokens
  async createPaymentToken(paymentMethodId: string, userId: number) {
    const token = crypto.randomBytes(32).toString('hex');
    
    return this.prisma.paymentToken.create({
      data: {
        token,
        type: 'PAYMENT_METHOD',
        userId: userId.toString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });
  }

  async validatePaymentToken(token: string) {
    const paymentToken = await this.prisma.paymentToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
      },
    });

    if (!paymentToken) {
      throw new Error('Invalid or expired payment token');
    }

    return paymentToken;
  }

  // Mask card numbers for display (PCI requirement)
  maskCardNumber(cardNumber: string): string {
    if (!cardNumber || cardNumber.length < 4) return '****';
    return `****-****-****-${cardNumber.slice(-4)}`;
  }

  // Log payment events for compliance
  async logPaymentEvent(event: string, details: any, userId?: number) {
    await this.prisma.paymentAuditLog.create({
      data: {
        action: 'PAYMENT_EVENT',
        event,
        details: JSON.stringify(details),
        userId: userId ? userId.toString() : null,
      },
    });
  }

  // Validate payment form data (no card storage)
  validatePaymentData(paymentData: any) {
    const errors = [];

    // Ensure no card data is being stored
    const forbiddenFields = ['cardNumber', 'cvv', 'expiryDate', 'securityCode'];
    forbiddenFields.forEach(field => {
      if (paymentData[field]) {
        errors.push(`${field} cannot be stored - use payment tokens only`);
      }
    });

    // Validate required token fields
    if (!paymentData.paymentMethodId && !paymentData.token) {
      errors.push('Payment method ID or token required');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Clean expired tokens (PCI requirement)
  async cleanupExpiredTokens() {
    await this.prisma.paymentToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }

  // Generate compliance report
  async generateComplianceReport() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const report = {
      period: '30 days',
      paymentTransactions: await this.prisma.payment.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      activeTokens: await this.prisma.paymentToken.count({
        where: { expiresAt: { gt: new Date() } },
      }),
      auditLogEntries: await this.prisma.paymentAuditLog.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      securityEvents: await this.prisma.paymentAuditLog.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          event: { in: ['PAYMENT_FAILED', 'TOKEN_EXPIRED', 'INVALID_TOKEN'] },
        },
      }),
    };

    return report;
  }
}