import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgeVerificationService {
  constructor(private prisma: PrismaService) {}

  async verifyAge(userId: number, dateOfBirth: Date, documentType?: string, documentNumber?: string) {
    const age = this.calculateAge(dateOfBirth);
    const isVerified = age >= 18;

    await this.prisma.ageVerification.create({
      data: {
        userId: userId.toString(),
        method: documentType || 'DATE_OF_BIRTH',
        verified: isVerified,
        age,
      },
    });

    return { isVerified, age };
  }

  async checkProductAgeRestriction(productId: number, userId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId.toString() },
      select: { ageRestricted: true, minimumAge: true },
    });

    if (!product?.ageRestricted) return { allowed: true };

    const verification = await this.prisma.ageVerification.findFirst({
      where: { userId: userId.toString(), verified: true },
      orderBy: { verifiedAt: 'desc' },
    });

    if (!verification) return { allowed: false, reason: 'Age verification required' };

    const allowed = verification.age >= (product.minimumAge || 18);
    return { 
      allowed, 
      reason: allowed ? null : `Minimum age ${product.minimumAge} required` 
    };
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    
    return age;
  }

  private hashDocument(documentNumber: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(documentNumber).digest('hex');
  }
}