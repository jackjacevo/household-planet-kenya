import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async getRecommendations(productId: string, userId?: string | number, limit = 6) {
    const recommendations = await this.prisma.productRecommendation.findMany({
      where: { productId },
      include: {
        recommended: {
          include: {
            category: true,
            variants: true
          }
        }
      },
      orderBy: { score: 'desc' },
      take: limit
    });

    return recommendations.map(rec => ({
      ...rec.recommended,
      images: rec.recommended.images ? JSON.parse(rec.recommended.images) : [],
      tags: rec.recommended.tags ? JSON.parse(rec.recommended.tags) : [],
      recommendationType: rec.type,
      score: rec.score
    }));
  }

  async getRelatedProducts(productId: string, limit = 6) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true, tags: true }
    });

    if (!product) return [];

    const relatedProducts = await this.prisma.product.findMany({
      where: {
        AND: [
          { id: { not: productId } },
          { isActive: true },
          {
            OR: [
              { categoryId: product.categoryId },
              product.tags ? { tags: { contains: product.tags } } : {}
            ].filter(condition => Object.keys(condition).length > 0)
          }
        ]
      },
      include: {
        category: true,
        variants: true
      },
      orderBy: { averageRating: 'desc' },
      take: limit
    });

    return relatedProducts.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
      tags: p.tags ? JSON.parse(p.tags) : []
    }));
  }

  async getRecentlyViewed(userId: string | number, limit = 10) {
    const userIdStr = typeof userId === 'string' ? userId : String(userId);
    const recentlyViewed = await this.prisma.recentlyViewed.findMany({
      where: { userId: userIdStr },
      include: {
        product: {
          include: {
            category: true,
            variants: true
          }
        }
      },
      orderBy: { viewedAt: 'desc' },
      take: limit
    });

    return recentlyViewed.map(rv => ({
      ...rv.product,
      images: rv.product.images ? JSON.parse(rv.product.images) : [],
      tags: rv.product.tags ? JSON.parse(rv.product.tags) : [],
      viewedAt: rv.viewedAt
    }));
  }

  async trackProductView(productId: string, userId?: string | number) {
    // Update product view count
    await this.prisma.product.update({
      where: { id: productId },
      data: { viewCount: { increment: 1 } }
    });

    // Track user view if logged in
    if (userId) {
      const userIdStr = typeof userId === 'string' ? userId : String(userId);
      await this.prisma.recentlyViewed.upsert({
        where: {
          userId_productId: { userId: userIdStr, productId }
        },
        update: { viewedAt: new Date() },
        create: { userId: userIdStr, productId }
      });
    }
  }

  async generateRecommendations() {
    // Get frequently bought together products
    const orderItems = await this.prisma.orderItem.findMany({
      include: { order: { include: { items: true } } }
    });

    const productPairs = new Map<string, Map<string, number>>();

    orderItems.forEach(item => {
      const otherItems = item.order.items.filter(i => i.productId !== item.productId);
      
      if (!productPairs.has(item.productId)) {
        productPairs.set(item.productId, new Map());
      }

      otherItems.forEach(otherItem => {
        const pairMap = productPairs.get(item.productId)!;
        const currentCount = pairMap.get(otherItem.productId) || 0;
        pairMap.set(otherItem.productId, currentCount + 1);
      });
    });

    // Save recommendations
    for (const [productId, pairs] of productPairs) {
      const sortedPairs = Array.from(pairs.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);

      for (const [recommendedId, count] of sortedPairs) {
        await this.prisma.productRecommendation.upsert({
          where: {
            productId_recommendedId_type: {
              productId,
              recommendedId,
              type: 'frequently_bought'
            }
          },
          update: { score: count },
          create: {
            productId,
            recommendedId,
            type: 'frequently_bought',
            score: count
          }
        });
      }
    }
  }
}