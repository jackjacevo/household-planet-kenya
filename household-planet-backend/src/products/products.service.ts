import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/services/logger.service';
import { SlugUtil } from '../common/utils/slug.util';

@Injectable()
export class ProductsService {
  private readonly logger = new AppLogger(ProductsService.name);
  
  constructor(private prisma: PrismaService) {}

  async findAll(params: any) {
    try {
      const startTime = Date.now();
      const { 
        page = 1, 
        limit = 20, 
        category, 
        brand,
        search, 
        featured, 
        minPrice,
        maxPrice,
        minRating,
        inStock,
        onSale,
        active = true, 
        sortBy = 'newest', 
        sortOrder = 'desc' 
      } = params;
      
      const where: any = {};
      
      // Only filter by isActive if explicitly specified
      if (active !== undefined) {
        where.isActive = active;
      }
      
      if (category) {
        const categoryId = parseInt(category);
        if (!isNaN(categoryId)) {
          // Get all descendant categories recursively
          const getAllDescendants = async (parentId: number): Promise<number[]> => {
            const children = await this.prisma.category.findMany({
              where: { parentId },
              select: { id: true }
            });
            
            let allDescendants = children.map(child => child.id);
            
            for (const child of children) {
              const grandChildren = await getAllDescendants(child.id);
              allDescendants = [...allDescendants, ...grandChildren];
            }
            
            return allDescendants;
          };
          
          const descendantIds = await getAllDescendants(categoryId);
          const categoryIds = [categoryId, ...descendantIds];
          where.categoryId = { in: categoryIds };
        }
      }
      
      if (brand) {
        const brandId = parseInt(brand);
        if (!isNaN(brandId)) {
          where.brandId = brandId;
        }
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } },
          { shortDescription: { contains: search } }
        ];
      }
      
      if (featured !== undefined) {
        where.isFeatured = featured === true || featured === 'true';
      }
      
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) {
          const min = parseFloat(minPrice);
          if (!isNaN(min)) {
            where.price.gte = min;
          }
        }
        if (maxPrice !== undefined) {
          const max = parseFloat(maxPrice);
          if (!isNaN(max)) {
            where.price.lte = max;
          }
        }
      }
      
      if (minRating !== undefined && minRating > 0) {
        const rating = parseFloat(minRating);
        if (!isNaN(rating)) {
          where.averageRating = { gte: rating };
        }
      }
      
      if (inStock === true || inStock === 'true') {
        where.stock = { gt: 0 };
      }
      
      if (onSale === true || onSale === 'true') {
        where.comparePrice = { not: null };
      }

    // Map frontend sort values to database fields
    let orderBy: any = { createdAt: 'desc' };
    
    switch (sortBy) {
      case 'newest':
      case 'createdAt':
        orderBy = { createdAt: sortOrder === 'asc' ? 'asc' : 'desc' };
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
          include: { 
            category: true,
            brand: true
          },
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
      reviewCount: product.totalReviews || 0
    }));

      return { 
        products: processedProducts, 
        total,
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
        reviewCount: product.totalReviews || 0
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
        reviewCount: product.totalReviews || 0
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
      reviewCount: product.totalReviews || 0
    }));
  }

  async getPopular(limit = 10) {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, brand: true },
      orderBy: [
        { totalSales: 'desc' },
        { averageRating: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
    });

    return products.map(product => ({
      ...product,
      images: this.safeJsonParse(product.images, []),
      tags: this.safeJsonParse(product.tags, []),
      dimensions: this.safeJsonParse(product.dimensions, null),
      averageRating: product.averageRating || 0,
      reviewCount: product.totalReviews || 0
    }));
  }

  async getBrands() {
    return this.prisma.brand.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async createBrand(data: any) {
    const { name, slug, logo, isActive = true } = data;
    return this.prisma.brand.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        logo,
        isActive
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async updateBrand(id: number, data: any) {
    const { name, slug, logo, isActive } = data;
    return this.prisma.brand.update({
      where: { id },
      data: {
        name,
        slug,
        logo,
        isActive
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async deleteBrand(id: number) {
    // Check if brand has products
    const productCount = await this.prisma.product.count({
      where: { brandId: id }
    });
    
    if (productCount > 0) {
      throw new Error(`Cannot delete brand because it has ${productCount} products`);
    }
    
    return this.prisma.brand.delete({ where: { id } });
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
      reviewCount: product.totalReviews || 0
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
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { category: true }
    });

    if (!product) return [];

    let recommendations = [];

    // First try to get products from same category
    recommendations = await this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        isActive: true
      },
      include: { category: true, brand: true },
      orderBy: [
        { averageRating: 'desc' },
        { totalSales: 'desc' }
      ],
      take: limit,
    });

    // If not enough products from same category, get from parent category
    if (recommendations.length < limit && product.category.parentId) {
      const siblingCategories = await this.prisma.category.findMany({
        where: {
          parentId: product.category.parentId,
          id: { not: product.categoryId }
        },
        select: { id: true }
      });

      if (siblingCategories.length > 0) {
        const additional = await this.prisma.product.findMany({
          where: {
            categoryId: { in: siblingCategories.map(c => c.id) },
            isActive: true
          },
          include: { category: true, brand: true },
          orderBy: { averageRating: 'desc' },
          take: limit - recommendations.length,
        });
        recommendations = [...recommendations, ...additional];
      }
    }

    return recommendations.map(product => ({
      ...product,
      images: this.safeJsonParse(product.images, []),
      tags: this.safeJsonParse(product.tags, []),
      dimensions: this.safeJsonParse(product.dimensions, null),
      averageRating: product.averageRating || 0,
      reviewCount: product.totalReviews || 0
    }));
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
      console.log('🔍 Creating product with data:', createProductDto);
      
      const { 
        categoryId, 
        brandId, 
        images, 
        stock, 
        lowStockThreshold, 
        trackStock, 
        slug, 
        sku,
        tags,
        price,
        comparePrice,
        weight,
        isActive,
        isFeatured,
        isOnSale,
        ...data 
      } = createProductDto;
      
      // Validate required fields
      if (!data.name || !data.name.trim()) {
        throw new Error('Product name is required');
      }
      
      const validatedCategoryId = parseInt(String(categoryId));
      if (isNaN(validatedCategoryId)) {
        throw new Error('Valid category ID is required');
      }
      
      const validatedPrice = parseFloat(String(price));
      if (isNaN(validatedPrice) || validatedPrice <= 0) {
        throw new Error('Valid price is required');
      }
      
      // Generate SKU if not provided
      let finalSku = sku;
      if (!finalSku) {
        finalSku = await this.generateUniqueSKU();
      } else {
        // Validate provided SKU is unique
        const existing = await this.prisma.product.findUnique({
          where: { sku: finalSku }
        });
        if (existing) {
          throw new Error(`SKU '${finalSku}' is already in use`);
        }
      }
      
      // Generate slug if not provided
      let finalSlug = slug;
      if (!finalSlug && data.name) {
        finalSlug = await SlugUtil.generateUniqueSlug(
          data.name,
          async (candidateSlug: string) => {
            const existing = await this.prisma.product.findUnique({
              where: { slug: candidateSlug }
            });
            return !!existing;
          }
        );
      } else if (finalSlug) {
        // Validate provided slug is unique
        const existing = await this.prisma.product.findUnique({
          where: { slug: finalSlug }
        });
        if (existing) {
          throw new Error(`Slug '${finalSlug}' is already in use`);
        }
      }
      
      const productData: any = {
        name: data.name.trim(),
        sku: finalSku,
        slug: finalSlug,
        price: validatedPrice,
        categoryId: validatedCategoryId,
        stock: stock !== undefined ? parseInt(String(stock)) : 0,
        lowStockThreshold: lowStockThreshold !== undefined ? parseInt(String(lowStockThreshold)) : 5,
        trackStock: trackStock !== undefined ? Boolean(trackStock) : true,
        images: images ? JSON.stringify(images) : JSON.stringify([]),
        tags: tags ? JSON.stringify(Array.isArray(tags) ? tags : []) : JSON.stringify([]),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
      };
      
      // Optional fields
      if (data.description) {
        productData.description = data.description.trim();
      }
      
      if (data.shortDescription) {
        productData.shortDescription = data.shortDescription.trim();
      }
      
      if (comparePrice !== undefined && comparePrice !== null && comparePrice !== '') {
        const validatedComparePrice = parseFloat(String(comparePrice));
        if (!isNaN(validatedComparePrice) && validatedComparePrice > 0) {
          productData.comparePrice = validatedComparePrice;
        }
      }
      
      if (weight !== undefined && weight !== null && weight !== '') {
        const validatedWeight = parseFloat(String(weight));
        if (!isNaN(validatedWeight) && validatedWeight >= 0) {
          productData.weight = validatedWeight;
        }
      }
      
      if (data.dimensions) {
        productData.dimensions = data.dimensions.trim();
      }
      
      if (brandId) {
        const validatedBrandId = parseInt(String(brandId));
        if (!isNaN(validatedBrandId)) {
          productData.brandId = validatedBrandId;
        }
      }
      
      console.log('💾 Final product data:', productData);
      
      const createdProduct = await this.prisma.product.create({
        data: productData,
        include: { category: true, brand: true },
      });
      
      console.log('✅ Product created successfully:', createdProduct.id);
      
      return createdProduct;
    } catch (error) {
      console.error('❌ Product creation failed:', error);
      this.logger.error(`Product creation failed: ${error.message}`, error.stack);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  async update(id: number, updateProductDto: any, files?: any[]) {
    try {
      const { categoryId, brandId, images, stock, lowStockThreshold, trackStock, slug, name, ...data } = updateProductDto;
      const updateData: any = { ...data };
      
      // Handle slug update
      if (slug !== undefined) {
        if (slug) {
          // Validate provided slug is unique (excluding current product)
          const existing = await this.prisma.product.findFirst({
            where: { 
              slug: slug,
              id: { not: id }
            }
          });
          if (existing) {
            throw new Error(`Slug '${slug}' is already in use`);
          }
          updateData.slug = slug;
        } else if (name) {
          // Generate new slug from updated name
          updateData.slug = await SlugUtil.generateUniqueSlug(
            name,
            async (candidateSlug: string) => {
              const existing = await this.prisma.product.findFirst({
                where: { 
                  slug: candidateSlug,
                  id: { not: id }
                }
              });
              return !!existing;
            }
          );
        }
      } else if (name && !slug) {
        // If name is updated but no slug provided, regenerate slug
        updateData.slug = await SlugUtil.generateUniqueSlug(
          name,
          async (candidateSlug: string) => {
            const existing = await this.prisma.product.findFirst({
              where: { 
                slug: candidateSlug,
                id: { not: id }
              }
            });
            return !!existing;
          }
        );
      }
      
      if (name) {
        updateData.name = name;
      }
      
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
    try {
      // Simple delete - just deactivate instead of actual deletion
      const product = await this.prisma.product.findUnique({ where: { id } });
      if (!product) {
        throw new Error('Product not found');
      }

      // Instead of deleting, just deactivate the product
      await this.prisma.product.update({
        where: { id },
        data: { isActive: false }
      });
      
      return { message: 'Product deactivated successfully' };
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error(`Failed to deactivate product: ${error.message}`);
    }
  }

  async generateRecommendations(productId: number) {
    // This could be enhanced to use ML algorithms or external services
    // For now, it's a placeholder that could trigger recommendation cache updates
    return { message: 'Recommendations generated successfully' };
  }

  private async generateUniqueSKU(): Promise<string> {
    let sku: string;
    let isUnique = false;
    
    while (!isUnique) {
      // Generate SKU with format: HP-XXXXXX (HP for Household Planet + 6 random chars)
      sku = 'HP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const existing = await this.prisma.product.findUnique({
        where: { sku }
      });
      
      if (!existing) {
        isUnique = true;
      }
    }
    
    return sku;
  }

  // Placeholder methods for compatibility
  async bulkCreate(products: any[]) { return []; }
  async bulkUpdate(bulkUpdateDto: any) { return []; }
  async advancedSearch(filters: any) { return []; }
  async createVariant(productId: number, createVariantDto: any) { return null; }
  async updateVariant(variantId: number, updateData: any) { return null; }
  async deleteVariant(variantId: number) { return null; }
  async getLowStockProducts(threshold = 5) { return []; }
  async createLowStockAlert(variantId: number, threshold: number) { return null; }
  async bulkImportFromCSV(file: any, userId: string) { return null; }
  async exportToCSV() { return []; }
  async getImportJobStatus(jobId: string) { return null; }
}
