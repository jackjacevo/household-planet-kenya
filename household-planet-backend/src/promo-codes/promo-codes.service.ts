import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromoCodeDto, UpdatePromoCodeDto, ValidatePromoCodeDto } from './dto/promo-code.dto';

@Injectable()
export class PromoCodesService {
  constructor(private prisma: PrismaService) {}

  async create(createPromoCodeDto: CreatePromoCodeDto, createdBy?: string) {
    const { applicableProducts, applicableCategories, ...data } = createPromoCodeDto;
    
    // Check if code already exists
    const existing = await this.prisma.promoCode.findUnique({
      where: { code: data.code.toUpperCase() }
    });
    
    if (existing) {
      throw new BadRequestException('Promo code already exists');
    }

    return this.prisma.promoCode.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        applicableProducts: applicableProducts ? JSON.stringify(applicableProducts) : null,
        applicableCategories: applicableCategories ? JSON.stringify(applicableCategories) : null,
        createdBy,
        validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      }
    });
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search ? {
      OR: [
        { code: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {};

    const [promoCodes, total] = await Promise.all([
      this.prisma.promoCode.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { usages: true }
          }
        }
      }),
      this.prisma.promoCode.count({ where })
    ]);

    return {
      data: promoCodes.map(code => ({
        ...code,
        applicableProducts: code.applicableProducts ? JSON.parse(code.applicableProducts) : [],
        applicableCategories: code.applicableCategories ? JSON.parse(code.applicableCategories) : [],
        totalUsages: code._count.usages
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: number) {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { id },
      include: {
        usages: {
          include: {
            user: { select: { name: true, email: true } },
            order: { select: { orderNumber: true } }
          },
          orderBy: { usedAt: 'desc' },
          take: 50
        }
      }
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    return {
      ...promoCode,
      applicableProducts: promoCode.applicableProducts ? JSON.parse(promoCode.applicableProducts) : [],
      applicableCategories: promoCode.applicableCategories ? JSON.parse(promoCode.applicableCategories) : [],
    };
  }

  async update(id: number, updatePromoCodeDto: UpdatePromoCodeDto) {
    const { applicableProducts, applicableCategories, ...data } = updatePromoCodeDto;
    
    const promoCode = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    return this.prisma.promoCode.update({
      where: { id },
      data: {
        ...data,
        applicableProducts: applicableProducts !== undefined ? JSON.stringify(applicableProducts) : undefined,
        applicableCategories: applicableCategories !== undefined ? JSON.stringify(applicableCategories) : undefined,
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      }
    });
  }

  async remove(id: number) {
    const promoCode = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    return this.prisma.promoCode.delete({ where: { id } });
  }

  async validatePromoCode(validateDto: ValidatePromoCodeDto, userId?: number) {
    const { code, orderAmount, productIds = [], categoryIds = [] } = validateDto;
    
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!promoCode) {
      throw new BadRequestException('Invalid promo code');
    }

    if (!promoCode.isActive) {
      throw new BadRequestException('Promo code is not active');
    }

    const now = new Date();
    if (promoCode.validFrom > now) {
      throw new BadRequestException('Promo code is not yet valid');
    }

    if (promoCode.validUntil && promoCode.validUntil < now) {
      throw new BadRequestException('Promo code has expired');
    }

    if (promoCode.minOrderAmount && orderAmount < promoCode.minOrderAmount) {
      throw new BadRequestException(`Minimum order amount of ${promoCode.minOrderAmount} required`);
    }

    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      throw new BadRequestException('Promo code usage limit reached');
    }

    // Check user usage limit
    if (userId && promoCode.userUsageLimit) {
      const userUsageCount = await this.prisma.promoCodeUsage.count({
        where: { promoCodeId: promoCode.id, userId }
      });
      
      if (userUsageCount >= promoCode.userUsageLimit) {
        throw new BadRequestException('You have reached the usage limit for this promo code');
      }
    }

    // Check product/category applicability
    if (promoCode.applicableProducts) {
      const applicableProducts = JSON.parse(promoCode.applicableProducts);
      if (applicableProducts.length > 0 && !productIds.some(id => applicableProducts.includes(id))) {
        throw new BadRequestException('Promo code not applicable to selected products');
      }
    }

    if (promoCode.applicableCategories) {
      const applicableCategories = JSON.parse(promoCode.applicableCategories);
      if (applicableCategories.length > 0 && !categoryIds.some(id => applicableCategories.includes(id))) {
        throw new BadRequestException('Promo code not applicable to selected categories');
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.discountType === 'PERCENTAGE') {
      discountAmount = (orderAmount * promoCode.discountValue) / 100;
      if (promoCode.maxDiscount && discountAmount > promoCode.maxDiscount) {
        discountAmount = promoCode.maxDiscount;
      }
    } else {
      discountAmount = Math.min(promoCode.discountValue, orderAmount);
    }

    return {
      valid: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        name: promoCode.name,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue
      },
      discountAmount,
      finalAmount: orderAmount - discountAmount
    };
  }

  async recordUsage(promoCodeId: number, userId: number | null, orderId: number | null, discountAmount: number, orderAmount: number, sessionId?: string) {
    await this.prisma.$transaction(async (tx) => {
      // Record usage
      await tx.promoCodeUsage.create({
        data: {
          promoCodeId,
          userId,
          orderId,
          sessionId,
          discountAmount,
          orderAmount
        }
      });

      // Update usage count
      await tx.promoCode.update({
        where: { id: promoCodeId },
        data: { usageCount: { increment: 1 } }
      });
    });
  }

  async recordOrderUsage(promoCode: string, userId: number | null, orderId: number, discountAmount: number, orderAmount: number) {
    const code = await this.prisma.promoCode.findUnique({
      where: { code: promoCode.toUpperCase() }
    });
    
    if (code) {
      await this.recordUsage(code.id, userId, orderId, discountAmount, orderAmount);
    }
  }

  async getAnalytics(id: number) {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { id },
      include: {
        usages: {
          select: {
            discountAmount: true,
            orderAmount: true,
            usedAt: true
          }
        }
      }
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    const totalDiscount = promoCode.usages.reduce((sum, usage) => sum + usage.discountAmount, 0);
    const totalOrderValue = promoCode.usages.reduce((sum, usage) => sum + usage.orderAmount, 0);
    const averageDiscount = promoCode.usages.length > 0 ? totalDiscount / promoCode.usages.length : 0;
    const averageOrderValue = promoCode.usages.length > 0 ? totalOrderValue / promoCode.usages.length : 0;

    return {
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        name: promoCode.name
      },
      analytics: {
        totalUsages: promoCode.usageCount,
        totalDiscount,
        totalOrderValue,
        averageDiscount,
        averageOrderValue,
        conversionRate: promoCode.usageLimit ? (promoCode.usageCount / promoCode.usageLimit) * 100 : null
      }
    };
  }
}