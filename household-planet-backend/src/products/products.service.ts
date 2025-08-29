import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/services/logger.service';

@Injectable()
export class ProductsService {
  private readonly logger = new AppLogger(ProductsService.name);
  
  constructor(private prisma: PrismaService) {}

  async findAll(params: any) {
    try {
      const startTime = Date.now();
      const { page = 1, limit = 20, category, search, featured, active = true, sortBy = 'newest', sortOrder = 'desc' } = params;
      
      const where: any = { isActive: active };
      
      if (category) {
        where.categoryId = category;
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

    // Map frontend sort values to database fields
    let orderBy: any = { createdAt: 'desc' };
    
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { totalSales: 'desc' };
        break;
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'name-asc':
        orderBy = { name: 'asc' };
        break;
      case 'name-desc':
        orderBy = { name: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          include: { category: true },
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.product.count({ where })
      ]);

      this.logger.logDatabaseOperation('SELECT', 'products', Date.now() - startTime);

    // Process products to parse JSON fields and add computed properties
    const processedProducts = products.map(product => ({
      ...product,
      images: this.safeJsonParse(product.images, []),
      tags: this.safeJsonParse(product.tags, []),
      dimensions: this.safeJsonParse(product.dimensions, null),
      averageRating: product.averageRating || 0,
      reviewCount: 0
    }));

      return { 
        data: processedProducts, 
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.logger.error(`Failed to fetch products: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: number, userId?: string, sessionId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (product && (userId || sessionId)) {
      await this.recordRecentlyViewed(id, userId, sessionId);
    }

    if (product) {
      return {
        ...product,
        images: this.safeJsonParse(product.images, []),
        tags: this.safeJsonParse(product.tags, []),
        dimensions: this.safeJsonParse(product.dimensions, null),
        averageRating: product.averageRating || 0,
        reviewCount: 0
      };
    }

    return product;
  }

  async findBySlug(slug: string, userId?: string, sessionId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (product && (userId || sessionId)) {
      await this.recordRecentlyViewed(product.id, userId, sessionId);
    }

    if (product) {
      return {
        ...product,
        images: this.safeJsonParse(product.images, []),
        tags: this.safeJsonParse(product.tags, []),
        dimensions: this.safeJsonParse(product.dimensions, null),
        averageRating: product.averageRating || 0,
        reviewCount: 0
      };
    }

    return product;
  }

  async getFeatured(limit = 10) {
    const products = await this.prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { category: true },
      take: limit,
    });

    return products.map(product => ({
      ...product,
      images: this.safeJsonParse(product.images, []),
      tags: this.safeJsonParse(product.tags, []),
      dimensions: this.safeJsonParse(product.dimensions, null),
      averageRating: product.averageRating || 0,
      reviewCount: 0
    }));
  }

  async search(query: string, limit = 20) {
    // Sanitize and validate search input
    const sanitizedQuery = query ? String(query).trim().slice(0, 100) : '';
    const validatedLimit = Math.min(100, Math.max(1, parseInt(String(limit)) || 20));
    
    if (!sanitizedQuery) {
      return [];
    }

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: sanitizedQuery } },
          { description: { contains: sanitizedQuery } }
        ]
      },
      include: { category: true },
      take: validatedLimit,
    });

    return products.map(product => ({
      ...product,
      images: this.safeJsonParse(product.images, []),
      tags: this.safeJsonParse(product.tags, []),
      dimensions: this.safeJsonParse(product.dimensions, null),
      averageRating: product.averageRating || 0,
      reviewCount: 0
    }));
  }

  async getAutocomplete(query: string, limit = 10) {
    // Sanitize and validate input
    const sanitizedQuery = query ? String(query).trim().slice(0, 50) : '';
    const validatedLimit = Math.min(20, Math.max(1, parseInt(String(limit)) || 10));
    
    if (!sanitizedQuery) {
      return [];
    }

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        name: { contains: sanitizedQuery }
      },
      select: { id: true, name: true, slug: true },
      take: validatedLimit,
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
      const validatedUserId = parseInt(String(userId));
      if (!isNaN(validatedUserId)) {
        where.userId = validatedUserId;
      } else {
        return [];
      }
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
      image: this.safeJsonParse(rv.product.images, [])[0] || '/images/placeholder.jpg',
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
        const validatedUserId = parseInt(String(userId));
        if (!isNaN(validatedUserId)) {
          data.userId = validatedUserId;
          await this.prisma.recentlyViewed.upsert({
            where: {
              userId_productId: {
                userId: validatedUserId,
                productId
              }
            },
            update: {
              viewedAt: new Date()
            },
            create: data
          });
        }
      } else if (sessionId) {
        data.sessionId = sessionId;
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
      console.error('Error recording recently viewed:', error);
    }
  }

  private safeJsonParse(jsonString: string | null, defaultValue: any = null): any {
    if (!jsonString) return defaultValue;
    try {
      return JSON.parse(jsonString);
    } catch {
      return defaultValue;
    }
  }

  // Admin methods (simplified)
  async create(createProductDto: any, files?: any[]) {
    try {
      const { categoryId, brandId, images, stock, lowStockThreshold, trackStock, ...data } = createProductDto;
      
      const validatedCategoryId = parseInt(String(categoryId));
      if (isNaN(validatedCategoryId)) {
        throw new Error('Invalid category ID');
      }
      
      const productData: any = {
        ...data,
        categoryId: validatedCategoryId,
        stock: stock !== undefined ? parseInt(String(stock)) : 0,
        lowStockThreshold: lowStockThreshold !== undefined ? parseInt(String(lowStockThreshold)) : 5,
        trackStock: trackStock !== undefined ? Boolean(trackStock) : true,
        images: images ? JSON.stringify(images) : JSON.stringify([]),
      };
      
      if (brandId) {
        const validatedBrandId = parseInt(String(brandId));
        if (!isNaN(validatedBrandId)) {
          productData.brandId = validatedBrandId;
        }
      }
      
      return await this.prisma.product.create({
        data: productData,
        include: { category: true, brand: true },
      });
    } catch (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  async update(id: number, updateProductDto: any, files?: any[]) {
    try {
      const { categoryId, brandId, images, stock, lowStockThreshold, trackStock, ...data } = updateProductDto;
      const updateData: any = { ...data };
      
      if (categoryId) {
        const validatedCategoryId = parseInt(String(categoryId));
        if (!isNaN(validatedCategoryId)) {
          updateData.categoryId = validatedCategoryId;
        }
      }
      
      if (brandId) {
        const validatedBrandId = parseInt(String(brandId));
        if (!isNaN(validatedBrandId)) {
          updateData.brandId = validatedBrandId;
        }
      }
      
      if (stock !== undefined) {
        updateData.stock = parseInt(String(stock));
      }
      
      if (lowStockThreshold !== undefined) {
        updateData.lowStockThreshold = parseInt(String(lowStockThreshold));
      }
      
      if (trackStock !== undefined) {
        updateData.trackStock = Boolean(trackStock);
      }
      
      if (images) {
        updateData.images = JSON.stringify(images);
      }

      return await this.prisma.product.update({
        where: { id },
        data: updateData,
        include: { category: true, brand: true },
      });
    } catch (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
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