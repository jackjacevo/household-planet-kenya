import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentSecurityService {
  constructor(private prisma: PrismaService) {}

  generatePaymentToken(orderId: string, amount: number): string {
    const data = `${orderId}-${amount}-${Date.now()}`;
    return crypto.createHash('sha256').update(data + process.env.JWT_SECRET).digest('hex');
  }

  validatePaymentToken(token: string, orderId: string, amount: number): boolean {
    const expectedToken = this.generatePaymentToken(orderId, amount);
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
  }

  encryptCardData(cardData: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY || 'default-key');
    let encrypted = cipher.update(cardData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decryptCardData(encryptedData: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY || 'default-key');
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  maskCardNumber(cardNumber: string): string {
    return cardNumber.replace(/\d(?=\d{4})/g, '*');
  }

  validatePaymentAmount(orderId: string, amount: number): Promise<boolean> {
    return this.prisma.order.findUnique({
      where: { id: orderId }
    }).then(order => order?.total === amount);
  }

  logSecurityEvent(event: string, details: any) {
    console.log(`[SECURITY] ${event}:`, details);
    // In production, this would log to a secure audit system
  }

  async createSecurePaymentSession(orderId: string, paymentMethod: string) {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.prisma.paymentSession.create({
      data: {
        sessionId,
        orderId,
        paymentMethod,
        expiresAt,
        status: 'ACTIVE'
      }
    });

    return { sessionId, expiresAt };
  }

  async validatePaymentSession(sessionId: string): Promise<boolean> {
    const session = await this.prisma.paymentSession.findUnique({
      where: { sessionId }
    });

    if (!session || session.status !== 'ACTIVE' || session.expiresAt < new Date()) {
      return false;
    }

    return true;
  }
}