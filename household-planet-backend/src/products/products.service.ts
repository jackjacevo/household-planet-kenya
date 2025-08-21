import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: any) {
    const { page = 1, limit = 20, category, search, featured, active = true, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    
    const where: any = { isActive: active };
    
    if (category) {
      where.categoryId = parseInt(category);
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }
    
    if (featured !== undefined) {
      where.isFeatured = featured;
    }

    const products = await this.prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await this.prisma.product.count({ where });

    return { products, total, page, limit };
  }

  async findOne(id: number, userId?: string, sessionId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, reviews: true },
    });

    if (product && (userId || sessionId)) {
      await this.recordRecentlyViewed(id, userId, sessionId);
    }

    return product;
  }

  async findBySlug(slug: string, userId?: string, sessionId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true, reviews: true },
    });

    if (product && (userId || sessionId)) {
      await this.recordRecentlyViewed(product.id, userId, sessionId);
    }

    return product;
  }

  async getFeatured(limit = 10) {
    return this.prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { category: true },
      take: limit,
    });
  }

  async search(query: string, limit = 20) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } }
        ]
      },
      include: { category: true },
      take: limit,
    });
  }

  async getAutocomplete(query: string, limit = 10) {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        name: { contains: query }
      },
      select: { id: true, name: true, slug: true },
      take: limit,
    });
    
    return products.map(p => ({ id: p.id, name: p.name, slug: p.slug }));
  }

  async getRecommendations(productId: number, type?: string, limit = 6) {
    // Simple recommendation: products from same category
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true }
    });

    if (!product) return [];

    return this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        isActive: true
      },
      include: { category: true },
      take: limit,
    });
  }

  async getRecentlyViewed(userId?: string, sessionId?: string, limit = 10) {
    const where: any = {};
    
    if (userId) {
      where.userId = parseInt(userId);
    } else if (sessionId) {
      where.sessionId = sessionId;
    } else {
      return [];
    }

    const recentlyViewed = await this.prisma.recentlyViewed.findMany({
      where,
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        viewedAt: 'desc'
      },
      take: limit
    });

    return recentlyViewed.map(rv => ({
      id: rv.product.id,
      name: rv.product.name,
      slug: rv.product.slug,
      price: rv.product.price,
      image: rv.product.images ? JSON.parse(rv.product.images)[0] || '/images/placeholder.jpg' : '/images/placeholder.jpg',
      category: rv.product.category,
      viewedAt: rv.viewedAt
    }));
  }

  private async recordRecentlyViewed(productId: number, userId?: string, sessionId?: string) {
    try {
      const data: any = {
        productId,
        viewedAt: new Date()
      };

      if (userId) {
        data.userId = parseInt(userId);
        // Upsert for logged-in users
        await this.prisma.recentlyViewed.upsert({
          where: {
            userId_productId: {
              userId: parseInt(userId),
              productId
            }
          },
          update: {
            viewedAt: new Date()
          },
          create: data
        });
      } else if (sessionId) {
        data.sessionId = sessionId;
        // Upsert for session-based tracking
        await this.prisma.recentlyViewed.upsert({
          where: {
            sessionId_productId: {
              sessionId,
              productId
            }
          },
          update: {
            viewedAt: new Date()
          },
          create: data
        });
      }
    } catch (error) {
      // Silently fail to avoid breaking product viewing
      console.error('Error recording recently viewed:', error);
    }
  }

  // Admin methods (simplified)
  async create(createProductDto: any, files?: any[]) {
    const { categoryId, ...data } = createProductDto;
    return this.prisma.product.create({
      data: {
        ...data,
        categoryId: parseInt(categoryId),
        images: files ? JSON.stringify(files.map(f => f.filename)) : null,
      },
      include: { category: true },
    });
  }

  async update(id: number, updateProductDto: any, files?: any[]) {
    const { categoryId, ...data } = updateProductDto;
    const updateData: any = { ...data };
    
    if (categoryId) updateData.categoryId = parseInt(categoryId);
    if (files && files.length > 0) {
      updateData.images = JSON.stringify(files.map(f => f.filename));
    }

    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });
  }

  async remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }

  // Placeholder methods for compatibility
  async bulkCreate(products: any[]) { return []; }
  async bulkUpdate(bulkUpdateDto: any) { return []; }
  async advancedSearch(filters: any) { return []; }
  async createVariant(productId: number, createVariantDto: any) { return null; }
  async updateVariant(variantId: number, updateData: any) { return null; }
  async deleteVariant(variantId: number) { return null; }
  async generateRecommendations(productId: number) { return null; }
  async getLowStockProducts(threshold = 5) { return []; }
  async createLowStockAlert(variantId: number, threshold: number) { return null; }
  async bulkImportFromCSV(file: any, userId: string) { return null; }
  async exportToCSV() { return []; }
  async getImportJobStatus(jobId: string) { return null; }
}