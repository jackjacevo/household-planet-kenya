import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class OrderIdService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate unique order ID with format: PREFIX-YYYYMMDD-HHMMSS-XXXX
   * Where XXXX is a random 4-character alphanumeric string
   */
  async generateOrderId(source: 'WEB' | 'WHATSAPP' | 'ADMIN' = 'WEB'): Promise<string> {
    const prefix = this.getPrefix(source);
    const now = new Date();
    
    // Format: YYYYMMDD-HHMMSS
    const dateStr = now.getFullYear().toString() +
                   (now.getMonth() + 1).toString().padStart(2, '0') +
                   now.getDate().toString().padStart(2, '0');
    
    const timeStr = now.getHours().toString().padStart(2, '0') +
                   now.getMinutes().toString().padStart(2, '0') +
                   now.getSeconds().toString().padStart(2, '0');
    
    // Generate random 4-character suffix
    const randomSuffix = randomBytes(2).toString('hex').toUpperCase();
    
    let orderNumber: string;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Ensure uniqueness
    do {
      if (attempts > 0) {
        // Add extra randomness if collision occurs
        const extraRandom = randomBytes(1).toString('hex').toUpperCase();
        orderNumber = `${prefix}-${dateStr}-${timeStr}-${randomSuffix}${extraRandom}`;
      } else {
        orderNumber = `${prefix}-${dateStr}-${timeStr}-${randomSuffix}`;
      }
      
      const existing = await this.prisma.order.findUnique({
        where: { orderNumber }
      });
      
      if (!existing) {
        return orderNumber;
      }
      
      attempts++;
    } while (attempts < maxAttempts);
    
    // Fallback to timestamp-based if all attempts fail
    return `${prefix}-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;
  }

  private getPrefix(source: string): string {
    switch (source) {
      case 'WHATSAPP':
        return 'WA';
      case 'ADMIN':
        return 'AD';
      case 'WEB':
      default:
        return 'HP';
    }
  }

  /**
   * Validate order number format
   */
  isValidOrderNumber(orderNumber: string): boolean {
    const pattern = /^(HP|WA|AD)-\d{8}-\d{6}-[A-F0-9]{4,6}$/;
    return pattern.test(orderNumber);
  }

  /**
   * Extract order source from order number
   */
  getOrderSource(orderNumber: string): string {
    if (orderNumber.startsWith('WA-')) return 'WHATSAPP';
    if (orderNumber.startsWith('AD-')) return 'ADMIN';
    if (orderNumber.startsWith('HP-')) return 'WEB';
    return 'UNKNOWN';
  }
}