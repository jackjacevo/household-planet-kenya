import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GeographicRestrictionsService {
  constructor(private prisma: PrismaService) {}

  private readonly restrictedRegions = {
    alcohol: ['Mandera', 'Wajir', 'Garissa'], // Example dry counties
    pharmaceuticals: [], // All regions allowed with prescription
    electronics: [], // No restrictions
  };

  async checkGeographicRestriction(productId: number, county: string, subcounty?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId.toString() },
      select: { 
        geographicRestrictions: true,
        restrictedRegions: true 
      },
    });

    if (!product) return { allowed: false, reason: 'Product not found' };

    // Check category-based restrictions
    const categoryRestrictions = this.restrictedRegions['general'] || [];
    if (categoryRestrictions.includes(county)) {
      return { 
        allowed: false, 
        reason: `Product not available in ${county}` 
      };
    }

    // Check product-specific restrictions
    if (product.restrictedRegions?.includes(county)) {
      return { 
        allowed: false, 
        reason: 'Product not available in your region' 
      };
    }

    return { allowed: true };
  }

  async getAvailableRegions(productId: number) {
    const kenyanCounties = [
      'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
      'Kitale', 'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho'
    ];

    const product = await this.prisma.product.findUnique({
      where: { id: productId.toString() },
      select: { 
        restrictedRegions: true 
      },
    });

    if (!product) return [];

    const categoryRestrictions = this.restrictedRegions['general'] || [];
    const productRestrictions = product.restrictedRegions || [];
    const allRestrictions = [...categoryRestrictions, ...productRestrictions];

    return kenyanCounties.filter(county => !allRestrictions.includes(county));
  }

  async logGeographicAccess(userId: number, productId: number, county: string, allowed: boolean) {
    await this.prisma.geographicAccessLog.create({
      data: {
        userId: userId ? userId.toString() : null,
        productId: productId.toString(),
        country: county,
        allowed,
        accessedAt: new Date(),
      },
    });
  }
}