import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PerformanceService {
  constructor(private prisma: PrismaService) {}

  async getOptimizedProducts(page: number = 1, limit: number = 20, category?: string) {
    const skip = (page - 1) * limit;
    
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        ...(category && { category: { slug: category } }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: true,
        averageRating: true,
        totalReviews: true,
        stock: true,
        category: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  async getCachedProduct(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: true,
        variants: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } },
        },
        _count: { select: { reviews: true } },
      },
    });
  }

  async trackPageLoad(url: string, loadTime: number, userId?: string) {
    return this.prisma.performanceMetric.create({
      data: {
        url,
        loadTime,
        userId,
        timestamp: new Date(),
      },
    });
  }

  async getPerformanceStats() {
    const [avgLoadTime, slowestPages] = await Promise.all([
      this.prisma.performanceMetric.aggregate({
        _avg: { loadTime: true },
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.performanceMetric.groupBy({
        by: ['url'],
        _avg: { loadTime: true },
        _count: { url: true },
        orderBy: { _avg: { loadTime: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      averageLoadTime: avgLoadTime._avg.loadTime || 0,
      slowestPages,
    };
  }

  getOptimizedImageUrl(originalUrl: string, width?: number, quality: number = 85) {
    if (!originalUrl) return '';
    
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    params.set('q', quality.toString());
    
    return `${originalUrl}?${params.toString()}`;
  }
}