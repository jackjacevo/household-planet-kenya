import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { SearchService } from './services/search.service';
import { RecommendationsService } from './services/recommendations.service';
import { InventoryService } from './services/inventory.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
    private recommendationsService: RecommendationsService,
    private inventoryService: InventoryService
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { images, tags, ...productData } = createProductDto;
    const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    return this.prisma.product.create({
      data: {
        ...productData,
        slug,
        images: images ? JSON.stringify(images) : null,
        tags: tags ? JSON.stringify(tags) : null,
        searchKeywords: `${productData.name} ${productData.description || ''} ${tags?.join(' ') || ''}`.toLowerCase(),
        stock: productData.stock || 0,
        lowStockThreshold: productData.lowStockThreshold || 10,
        trackInventory: productData.trackInventory !== false
      },
      include: { category: true, variants: true }
    });
  }

  async findAll(page = 1, limit = 10, categoryId?: string, featured?: boolean) {
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };
    
    if (categoryId) where.categoryId = categoryId;
    if (featured !== undefined) where.isFeatured = featured;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { category: true, variants: true },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.product.count({ where })
    ]);

    return {
      products: products.map(product => ({
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        tags: product.tags ? JSON.parse(product.tags) : []
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string, userId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { 
        category: true, 
        variants: { where: { isActive: true } }, 
        reviews: { 
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (product) {
      // Track product view
      await this.recommendationsService.trackProductView(id, userId);
      
      const [recommendations, relatedProducts] = await Promise.all([
        this.recommendationsService.getRecommendations(id, userId),
        this.recommendationsService.getRelatedProducts(id)
      ]);

      return {
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        tags: product.tags ? JSON.parse(product.tags) : [],
        recommendations,
        relatedProducts,
        reviews: product.reviews.map(review => ({
          ...review,
          images: review.images ? JSON.parse(review.images) : []
        }))
      };
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, tags, ...productData } = updateProductDto as any;
    
    const updateData: any = { ...productData };
    if (images) updateData.images = JSON.stringify(images);
    if (tags) {
      updateData.tags = JSON.stringify(tags);
      updateData.searchKeywords = `${productData.name || ''} ${productData.description || ''} ${tags.join(' ')}`.toLowerCase();
    }
    
    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true, variants: true }
    });
    
    // Check inventory if stock was updated
    if (productData.stock !== undefined) {
      await this.inventoryService.checkLowStock(id, null);
    }
    
    return product;
  }

  async remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  async createVariant(productId: string, createVariantDto: CreateVariantDto) {
    const variant = await this.prisma.productVariant.create({
      data: {
        ...createVariantDto,
        productId,
        lowStockThreshold: createVariantDto.lowStockThreshold || 5,
        attributes: createVariantDto.attributes ? JSON.stringify(createVariantDto.attributes) : null
      }
    });
    
    // Check for low stock
    await this.inventoryService.checkLowStock(null, variant.id);
    return variant;
  }

  async updateVariant(variantId: string, updateData: Partial<CreateVariantDto>) {
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...updateData,
        attributes: updateData.attributes ? JSON.stringify(updateData.attributes) : undefined
      }
    });
  }

  async removeVariant(variantId: string) {
    return this.prisma.productVariant.delete({ where: { id: variantId } });
  }

  async bulkUpdatePrices(updates: { id: string; price: number }[]) {
    const results = await Promise.all(
      updates.map(update =>
        this.prisma.product.update({
          where: { id: update.id },
          data: { price: update.price }
        })
      )
    );
    return { updated: results.length };
  }

  async search(query: string, page = 1, limit = 10) {
    return this.searchService.advancedSearch({ q: query, page, limit });
  }

  async advancedSearch(filters: any) {
    return this.searchService.advancedSearch(filters);
  }

  async getSearchSuggestions(query: string) {
    return this.searchService.getSearchSuggestions(query);
  }

  async createReview(productId: string, userId: string, createReviewDto: CreateReviewDto) {
    const review = await this.prisma.review.create({
      data: {
        ...createReviewDto,
        productId,
        userId,
        images: createReviewDto.images ? JSON.stringify(createReviewDto.images) : null
      },
      include: { user: { select: { name: true } } }
    });

    // Update product average rating
    await this.updateProductRating(productId);
    
    return {
      ...review,
      images: review.images ? JSON.parse(review.images) : []
    };
  }

  async getRecentlyViewed(userId: string) {
    return this.recommendationsService.getRecentlyViewed(userId);
  }

  async updateStock(productId: string, variantId: string | null, quantity: number, operation: 'add' | 'subtract') {
    return this.inventoryService.updateStock(productId, variantId, quantity, operation);
  }

  async getLowStockProducts() {
    return this.inventoryService.getLowStockProducts();
  }

  async getInventoryAlerts() {
    return this.inventoryService.getInventoryAlerts(false);
  }

  async findBySlug(slug: string, userId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { 
        category: true, 
        variants: { where: { isActive: true } }, 
        reviews: { 
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (product && userId) {
      await this.trackView(product.id, userId);
    }

    if (product) {
      return {
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        tags: product.tags ? JSON.parse(product.tags) : [],
        reviews: product.reviews.map(review => ({
          ...review,
          images: review.images ? JSON.parse(review.images) : []
        }))
      };
    }

    return product;
  }

  async getRelatedProducts(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true }
    });

    if (!product) return [];

    const relatedProducts = await this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        isActive: true
      },
      take: 8,
      include: { category: true },
      orderBy: { viewCount: 'desc' }
    });

    return relatedProducts.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));
  }

  async trackView(productId: string, userId: string) {
    // Update product view count
    await this.prisma.product.update({
      where: { id: productId },
      data: { viewCount: { increment: 1 } }
    });

    // Track in recently viewed
    await this.prisma.recentlyViewed.upsert({
      where: {
        userId_productId: {
          userId,
          productId
        }
      },
      update: {
        viewedAt: new Date()
      },
      create: {
        userId,
        productId,
        viewedAt: new Date()
      }
    });

    return { success: true };
  }

  async removeFromRecentlyViewed(userId: string, productId: string) {
    await this.prisma.recentlyViewed.delete({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    return { success: true };
  }

  private async updateProductRating(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    });

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length
      }
    });
  }
}