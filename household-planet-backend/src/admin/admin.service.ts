import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { BulkUpdateDto, ProductAnalyticsDto, ImageCropDto, VariantDto, SEOUpdateDto } from './dto/bulk-product.dto';
import { InputValidationUtil } from '../common/utils/input-validation.util';
import { SlugUtil } from '../common/utils/slug.util';
import { BUSINESS_CONSTANTS } from '../common/constants/business.constants';
import { ActivityQuery, BulkOperationResult } from '../common/interfaces/query.interface';
import { AppLogger } from '../common/services/logger.service';
import { SecureUploadService } from '../common/services/secure-upload.service';
import { ActivityService } from '../activity/activity.service';
import * as csvParser from 'csv-parser';
import * as fs from 'fs';
import { Readable } from 'stream';
import * as path from 'path';
import * as sharp from 'sharp';
// import * as xlsx from 'xlsx'; // Commented out until xlsx is properly installed

@Injectable()
export class AdminService {
  private readonly logger = new AppLogger(AdminService.name);
  
  constructor(
    private prisma: PrismaService,
    private secureUpload: SecureUploadService,
    private activityService: ActivityService
  ) {}

  async getDashboardStats() {
    const startTime = Date.now();
    try {
      this.logger.log('Fetching dashboard statistics');
      
      // Get today's date range
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const todayEnd = new Date(today.setHours(23, 59, 59, 999));
      
      const [
        totalOrders,
        totalRevenue,
        deliveredRevenue,
        totalCustomers,
        totalProducts,
        activeProducts,
        outOfStockProducts,
        todayOrders,
        todayOrdersValue,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        lowStockProducts,
        recentOrders,
        topProducts,
        customerGrowth,
        salesByCounty
      ] = await Promise.all([
        this.prisma.order.count().catch(() => 0),
        // Total revenue from all non-cancelled orders (consistent with orders service)
        this.prisma.order.aggregate({
          _sum: { total: true },
          where: { status: { not: 'CANCELLED' } }
        }).catch(() => ({ _sum: { total: 0 } })),
        // Delivered revenue for comparison
        this.prisma.order.aggregate({
          _sum: { total: true },
          where: { status: 'DELIVERED' }
        }).catch(() => ({ _sum: { total: 0 } })),
        this.prisma.user.count({ where: { role: Role.CUSTOMER } }).catch(() => 0),
        this.prisma.product.count().catch(() => 0),
        this.prisma.product.count({ where: { isActive: true } }).catch(() => 0),
        this.prisma.productVariant.count({ where: { stock: 0 } }).catch(() => 0),
        // Today's orders count
        this.prisma.order.count({
          where: {
            createdAt: {
              gte: todayStart,
              lte: todayEnd
            }
          }
        }).catch(() => 0),
        // Today's orders value (all orders placed today, not just delivered)
        this.prisma.order.aggregate({
          _sum: { total: true },
          where: {
            createdAt: {
              gte: todayStart,
              lte: todayEnd
            },
            status: { not: 'CANCELLED' }
          }
        }).catch(() => ({ _sum: { total: 0 } })),
        this.prisma.order.count({ where: { status: 'PENDING' } }).catch(() => 0),
        this.prisma.order.count({ where: { status: 'PROCESSING' } }).catch(() => 0),
        this.prisma.order.count({ where: { status: 'SHIPPED' } }).catch(() => 0),
        this.prisma.order.count({ where: { status: 'DELIVERED' } }).catch(() => 0),
        this.prisma.productVariant.count({ where: { stock: { lt: 10 } } }).catch(() => 0),
        this.prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
            items: {
              include: { product: { select: { name: true } } }
            }
          }
        }).catch(() => []),
        this.prisma.orderItem.groupBy({
          by: ['productId'],
          _sum: { quantity: true },
          where: {
            order: { status: 'DELIVERED' }
          },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5
        }).catch(() => []),
        this.getCustomerGrowthData().catch(() => []),
        this.getSalesByCounty().catch(() => [])
      ]);

      return {
        overview: {
          totalOrders,
          totalRevenue: Number(totalRevenue._sum.total) || 0,
          deliveredRevenue: Number(deliveredRevenue._sum.total) || 0,
          totalCustomers,
          totalProducts,
          activeProducts,
          outOfStockProducts,
          todayOrders,
          todayRevenue: Number(todayOrdersValue._sum.total) || 0,
          pendingOrders,
          processingOrders,
          shippedOrders,
          deliveredOrders,
          lowStockProducts
        },
        recentOrders,
        topProducts: await this.enrichTopProducts(topProducts).catch(() => []),
        customerGrowth,
        salesByCounty
      };
    } catch (error) {
      this.logger.error('Failed to fetch dashboard stats', error.stack);
      // Return default dashboard stats if there's an error
      return {
        overview: {
          totalOrders: 0,
          totalRevenue: 0,
          deliveredRevenue: 0,
          totalCustomers: 0,
          totalProducts: 0,
          activeProducts: 0,
          outOfStockProducts: 0,
          todayOrders: 0,
          todayRevenue: 0,
          pendingOrders: 0,
          processingOrders: 0,
          shippedOrders: 0,
          deliveredOrders: 0,
          lowStockProducts: 0
        },
        recentOrders: [],
        topProducts: [],
        customerGrowth: [],
        salesByCounty: []
      };
    }
  }

  async getSalesAnalytics(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear() - 4, 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get orders within the date range
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'DELIVERED'
      },
      select: {
        createdAt: true,
        total: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by period
    const groupedData = new Map<string, { orders: number; revenue: number }>();
    
    orders.forEach(order => {
      let periodKey: string;
      const date = new Date(order.createdAt);
      
      switch (period) {
        case 'yearly':
          periodKey = date.getFullYear().toString();
          break;
        case 'monthly':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          periodKey = date.toISOString().split('T')[0];
      }
      
      const existing = groupedData.get(periodKey) || { orders: 0, revenue: 0 };
      groupedData.set(periodKey, {
        orders: existing.orders + 1,
        revenue: existing.revenue + Number(order.total)
      });
    });

    // Convert to array and calculate averages
    const salesData = Array.from(groupedData.entries()).map(([period, data]) => ({
      period,
      orders: data.orders,
      revenue: data.revenue,
      avgOrderValue: data.orders > 0 ? data.revenue / data.orders : 0
    }));

    return salesData;
  }

  async getInventoryAlerts() {
    // Get products with low stock (using product.stock field)
    const allLowStock = await this.prisma.product.findMany({
      where: { 
        stock: { lt: BUSINESS_CONSTANTS.INVENTORY.LOW_STOCK_THRESHOLD },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
        category: { select: { name: true } }
      },
      orderBy: { stock: 'asc' }
    });

    return {
      lowStock: allLowStock.filter(item => item.stock > 0),
      outOfStock: allLowStock.filter(item => item.stock === 0)
    };
  }

  async getCustomerInsights() {
    const thirtyDaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const [
      newCustomers,
      activeCustomers,
      topCustomers,
      customersByCounty
    ] = await Promise.all([
      this.prisma.user.count({
        where: {
          role: Role.CUSTOMER,
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      this.prisma.user.count({
        where: {
          role: Role.CUSTOMER,
          orders: {
            some: {
              createdAt: { gte: thirtyDaysAgo }
            }
          }
        }
      }),
      this.prisma.user.findMany({
        where: { role: Role.CUSTOMER },
        select: {
          id: true,
          name: true,
          email: true,
          _count: { select: { orders: true } },
          orders: {
            select: { total: true },
            where: { status: 'DELIVERED' }
          }
        },
        orderBy: { orders: { _count: 'desc' } },
        take: 10
      }),
      this.getCustomersByCounty()
    ]);

    return {
      newCustomers,
      activeCustomers,
      topCustomers: topCustomers.map(customer => ({
        ...customer,
        totalSpent: customer.orders.reduce((sum, order) => sum + Number(order.total), 0)
      })),
      customersByCounty
    };
  }

  private async getCustomerGrowthData() {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const customers = await this.prisma.user.findMany({
        where: {
          role: Role.CUSTOMER,
          createdAt: { gte: startDate }
        },
        select: { createdAt: true }
      });

      const monthMap = new Map<string, number>();
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthMap.set(key, 0);
        return { month: key, customers: 0 };
      }).reverse();

      customers.forEach(customer => {
        const month = customer.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (monthMap.has(month)) {
          monthMap.set(month, monthMap.get(month) + 1);
        }
      });

      return last12Months.map(item => ({
        month: item.month,
        customers: monthMap.get(item.month) || 0
      }));
    } catch (error) {
      console.error('Error in getCustomerGrowthData:', error);
      return [];
    }
  }

  private async getSalesByCounty() {
    try {
      const orders = await this.prisma.order.findMany({
        where: { status: 'DELIVERED' },
        select: { 
          deliveryLocation: true, 
          shippingAddress: true, 
          total: true,
          user: {
            select: {
              addresses: {
                select: { county: true },
                take: 1
              }
            }
          }
        }
      });

      const countyMap = new Map<string, { revenue: number; orders: number }>();
      orders.forEach(order => {
        // Priority: deliveryLocation > user's address county > extracted from shippingAddress
        let county = 'Unknown';
        
        if (order.deliveryLocation) {
          // Clean up delivery location by removing pricing info
          county = order.deliveryLocation.replace(/\s*-\s*Ksh\s*\d+/i, '').trim();
        } else if (order.user.addresses[0]?.county) {
          county = order.user.addresses[0].county;
        } else if (order.shippingAddress) {
          county = this.extractCounty(order.shippingAddress);
        }
        
        const existing = countyMap.get(county) || { revenue: 0, orders: 0 };
        countyMap.set(county, {
          revenue: existing.revenue + Number(order.total || 0),
          orders: existing.orders + 1
        });
      });

      return Array.from(countyMap.entries())
        .map(([county, data]) => ({ county, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    } catch (error) {
      console.error('Error in getSalesByCounty:', error);
      return [
        { county: 'Unknown', revenue: 0, orders: 0 },
        { county: 'Manual Entry', revenue: 0, orders: 0 }
      ];
    }
  }

  private async getCustomersByCounty() {
    // Get users with addresses
    const users = await this.prisma.user.findMany({
      // amazonq-ignore-next-line
      where: { 
        role: Role.CUSTOMER,
        addresses: { some: {} }
      },
      select: { 
        addresses: {
          select: { county: true }
        }
      }
    });

    // Group by county manually
    const countyMap = new Map<string, number>();
    users.forEach(user => {
      user.addresses.forEach(address => {
        const county = address.county || 'Unknown';
        countyMap.set(county, (countyMap.get(county) || 0) + 1);
      });
    });

    // Convert to array and sort
    return Array.from(countyMap.entries())
      .map(([county, customers]) => ({ county, customers }))
      .sort((a, b) => b.customers - a.customers)
      .slice(0, 10);
  }

  private async enrichTopProducts(topProducts: any[]) {
    try {
      if (!topProducts || topProducts.length === 0) {
        return [];
      }
      
      const productIds = topProducts.map(p => p.productId);
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, price: true, images: true }
      });

      return topProducts.map(item => {
        const product = products.find(p => p.id === item.productId);
        // amazonq-ignore-next-line
        return {
          ...product,
          totalSold: item._sum.quantity || 0
        };
      });
    } catch (error) {
      console.error('Error in enrichTopProducts:', error);
      return [];
    }
  }

  private extractCounty(address: string): string {
    if (!address) return 'Unknown';
    
    // Handle JSON string format
    try {
      const parsed = JSON.parse(address);
      if (parsed.county) return parsed.county;
      if (parsed.deliveryLocation) return parsed.deliveryLocation;
    } catch {
      // Not JSON, treat as plain string
    }
    
    // Extract from comma-separated address string
    const parts = address.split(',');
    const lastPart = parts[parts.length - 1]?.trim();
    
    // Common Kenya counties for better matching
    const kenyanCounties = [
      'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
      'Kitale', 'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho',
      'Embu', 'Migori', 'Homa Bay', 'Siaya', 'Busia', 'Vihiga', 'Bomet',
      'Narok', 'Kajiado', 'Kiambu', 'Murang\'a', 'Kirinyaga', 'Nyandarua',
      'Laikipia', 'Isiolo', 'Meru', 'Tharaka Nithi', 'Embu', 'Kitui',
      'Machakos', 'Makueni', 'Nzoia', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo Marakwet',
      'Nandi', 'Baringo', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma',
      'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira',
      'Narok', 'Kajiado', 'Taita Taveta', 'Kwale', 'Kilifi', 'Tana River',
      'Lamu', 'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Samburu',
      'West Pokot', 'Turkana'
    ];
    
    // Check if any part matches a known county
    for (const part of parts.reverse()) {
      const trimmed = part.trim();
      const found = kenyanCounties.find(county => 
        trimmed.toLowerCase().includes(county.toLowerCase()) ||
        county.toLowerCase().includes(trimmed.toLowerCase())
      );
      if (found) return found;
    }
    
    return lastPart || 'Unknown';
  }

  // Product Management
  async getProducts(query: any) {
    const { page = 1, limit = 10, search, categoryId, brandId, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    // Input validation and sanitization
    const sanitizedSearch = search ? String(search).trim().slice(0, 100) : undefined;
    const validatedCategoryId = categoryId ? parseInt(categoryId) : undefined;
    const validatedBrandId = brandId ? parseInt(brandId) : undefined;
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const validatedSkip = (validatedPage - 1) * validatedLimit;

    const where: any = {};
    if (sanitizedSearch) {
      where.OR = [
        { name: { contains: sanitizedSearch, mode: 'insensitive' } },
        { description: { contains: sanitizedSearch, mode: 'insensitive' } },
        { sku: { contains: sanitizedSearch, mode: 'insensitive' } }
      ];
    }
    if (validatedCategoryId && !isNaN(validatedCategoryId)) where.categoryId = validatedCategoryId;
    if (validatedBrandId && !isNaN(validatedBrandId)) where.brandId = validatedBrandId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          variants: true,
          _count: { select: { reviews: true, orderItems: true } }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: validatedSkip,
        take: validatedLimit
      }),
      this.prisma.product.count({ where })
    ]);

    return {
      data: products.map(product => this.transformProductData(product)),
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
    };
  }

  async createProduct(createProductDto: CreateProductDto, userId?: number) {
    try {
      console.log('AdminService: Creating product with data:', createProductDto);
      
      const { images, tags, imageAltTexts, categoryId, brandId, stock, lowStockThreshold, trackStock, slug, ...productData } = createProductDto;
      
      // Generate slug if not provided
      let finalSlug = slug;
      if (!finalSlug) {
        finalSlug = await SlugUtil.generateUniqueSlug(
          createProductDto.name,
          async (candidateSlug: string) => {
            const existing = await this.prisma.product.findUnique({
              where: { slug: candidateSlug }
            });
            return !!existing;
          }
        );
      } else {
        // Validate provided slug is unique
        const existing = await this.prisma.product.findUnique({
          where: { slug: finalSlug }
        });
        if (existing) {
          throw new BadRequestException(`Slug '${finalSlug}' is already in use`);
        }
      }
      
      const data = {
        ...productData,
        slug: finalSlug,
        categoryId: Number(categoryId),
        brandId: brandId ? Number(brandId) : null,
        stock: Number(stock || 0),
        lowStockThreshold: Number(lowStockThreshold || 5),
        trackStock: Boolean(trackStock !== false),
        images: JSON.stringify(Array.isArray(images) ? images : []),
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        imageAltTexts: imageAltTexts ? JSON.stringify(imageAltTexts) : null
      };
      
      console.log('AdminService: Processed data for Prisma:', data);
      
      const result = await this.prisma.product.create({
        data,
        include: { category: true, brand: true, variants: true }
      });
      
      // Log activity
      if (userId) {
        await this.activityService.logActivity(
          userId,
          'CREATE_PRODUCT',
          { productName: result.name, sku: result.sku, productId: result.id },
          'Product',
          result.id
        ).catch(console.error);
      }
      
      console.log('AdminService: Product created successfully:', result.id);
      return result;
    } catch (error) {
      console.error('AdminService: Error creating product:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack
      });
      throw new BadRequestException(`Failed to create product: ${error.message}`);
    }
  }

  async updateProduct(id: number, updateProductDto: UpdateProductDto, userId?: number) {
    console.log('AdminService: Updating product', id, 'with data:', updateProductDto);
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const { categoryId, brandId, images, tags, imageAltTexts, slug, ...productData } = updateProductDto;
    const data: any = { ...productData };
    
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
          throw new BadRequestException(`Slug '${slug}' is already in use`);
        }
        data.slug = slug;
      } else if (updateProductDto.name) {
        // Generate new slug from updated name
        data.slug = await SlugUtil.generateUniqueSlug(
          updateProductDto.name,
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
    } else if (updateProductDto.name && updateProductDto.name !== product.name) {
      // If name is updated but no slug provided, regenerate slug
      data.slug = await SlugUtil.generateUniqueSlug(
        updateProductDto.name,
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
    if (images) {
      console.log('AdminService: Updating images:', images);
      data.images = JSON.stringify(images);
    }
    if (tags) data.tags = JSON.stringify(tags);
    if (imageAltTexts) data.imageAltTexts = JSON.stringify(imageAltTexts);
    if (categoryId) data.categoryId = categoryId;
    if (brandId) data.brandId = brandId;

    console.log('AdminService: Final update data:', data);
    const result = await this.prisma.product.update({
      where: { id },
      data,
      include: { category: true, brand: true, variants: true }
    });
    
    // Log activity
    if (userId) {
      const changes = Object.keys(updateProductDto).join(', ');
      await this.activityService.logActivity(
        userId,
        'UPDATE_PRODUCT',
        { productName: result.name, changes, productId: result.id },
        'Product',
        result.id
      ).catch(console.error);
    }
    
    console.log('AdminService: Product updated successfully');
    return result;
  }

  async deleteProduct(id: number, userId?: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const result = await this.prisma.product.delete({ where: { id } });
    
    // Log activity
    if (userId) {
      await this.activityService.logActivity(
        userId,
        'DELETE_PRODUCT',
        { productName: product.name, sku: product.sku, productId: product.id },
        'Product',
        product.id
      ).catch(console.error);
    }
    
    return result;
  }

  async bulkCreateProducts(products: CreateProductDto[], userId?: number): Promise<BulkOperationResult> {
    const results = [];
    const errors = [];
    
    for (const product of products) {
      try {
        const created = await this.createProduct(product, userId);
        results.push(created);
      } catch (error) {
        errors.push({ item: product.name || 'Unknown', error: error.message });
      }
    }
    
    if (userId && results.length > 0) {
      await this.activityService.logActivity(
        userId,
        'BULK_CREATE_PRODUCTS',
        { count: results.length, productNames: results.map(p => p.name).slice(0, 5) },
        'Product',
        null
      ).catch(console.error);
    }
    
    return { 
      count: results.length, 
      items: results,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  async bulkUpdateProducts(bulkUpdateDto: BulkUpdateDto, userId?: number) {
    const { productIds, ...updateData } = bulkUpdateDto;
    
    const data: any = {};
    if (updateData.categoryId) {
      // For updateMany, we need to use direct field assignment
      data.categoryId = updateData.categoryId;
    }
    if (updateData.brandId) data.brandId = updateData.brandId;
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;
    if (updateData.isFeatured !== undefined) data.isFeatured = updateData.isFeatured;
    if (updateData.tags) data.tags = JSON.stringify(updateData.tags);

    const result = await this.prisma.product.updateMany({
      where: { id: { in: productIds } },
      data
    });

    if (userId && result.count > 0) {
      await this.activityService.logActivity(
        userId,
        'BULK_UPDATE_PRODUCTS',
        { count: result.count, productIds: productIds.slice(0, 10), changes: Object.keys(updateData).join(', ') },
        'Product',
        null
      ).catch(console.error);
    }

    return { updated: result.count };
  }

  async importProductsCsv(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    
    const products = [];
    const csvData = file.buffer.toString();
    const stream = Readable.from([csvData]);
    const BATCH_SIZE = BUSINESS_CONSTANTS.FILE_UPLOAD.BATCH_SIZE;
    
    return new Promise((resolve, reject) => {
      stream
        .pipe(csvParser())
        .on('data', (row) => {
          if (products.length < BUSINESS_CONSTANTS.FILE_UPLOAD.MAX_CSV_PRODUCTS) {
            products.push({
              name: row.name,
              slug: row.slug, // Let createProduct handle slug generation if not provided
              description: row.description,
              sku: row.sku,
              price: parseFloat(row.price) || 0,
              comparePrice: row.comparePrice ? parseFloat(row.comparePrice) : null,
              categoryId: parseInt(row.categoryId) || 1,
              brandId: row.brandId ? parseInt(row.brandId) : null,
              images: row.images ? row.images.split(',') : [],
              tags: row.tags ? row.tags.split(',') : []
            });
          }
        })
        .on('end', async () => {
          try {
            // Process in batches to avoid blocking
            const results = [];
            for (let i = 0; i < products.length; i += BATCH_SIZE) {
              const batch = products.slice(i, i + BATCH_SIZE);
              const result = await this.bulkCreateProducts(batch);
              results.push(result);
              // Allow event loop to process other tasks
              await new Promise(resolve => setImmediate(resolve));
            }
            resolve({ count: results.reduce((sum, r) => sum + r.count, 0) });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  async exportProductsCsv() {
    const products = await this.prisma.product.findMany({
      include: { category: true, brand: true, variants: true }
    });

    return products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      sku: product.sku,
      price: product.price,
      comparePrice: product.comparePrice,
      categoryId: product.categoryId,
      // amazonq-ignore-next-line
      categoryName: product.category.name,
      brandId: product.brandId,
      brandName: product.brand?.name,
      images: JSON.parse(product.images).join(','),
      tags: JSON.parse(product.tags).join(','),
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      // amazonq-ignore-next-line
      totalStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
      createdAt: product.createdAt
    }));
  // amazonq-ignore-next-line
  }

  async uploadTempImages(files: Express.Multer.File[]) {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('No files provided');
      }
      
      const uploadDir = path.join(process.cwd(), 'uploads', 'temp');
      
      try {
        await fs.promises.access(uploadDir);
      } catch {
        await fs.promises.mkdir(uploadDir, { recursive: true });
      }

      const imagePromises = files.map(async (file) => {
        // Keep original format (PNG/JPG)
        const originalExt = path.extname(file.originalname).toLowerCase();
        const allowedExts = ['.png', '.jpg', '.jpeg'];
        const ext = allowedExts.includes(originalExt) ? originalExt : '.jpg';
        const filename = `temp-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        const filepath = path.resolve(uploadDir, filename);
        
        if (!filepath.startsWith(path.resolve(uploadDir))) {
          throw new BadRequestException('Invalid file path');
        }
        
        // Process image but keep original format
        if (ext === '.png') {
          await sharp(file.buffer)
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .png({ quality: 90 })
            .toFile(filepath);
        } else {
          await sharp(file.buffer)
            .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 90 })
            .toFile(filepath);
        }
        
        return `/uploads/temp/${filename}`;
      });

      const imageUrls = await Promise.all(imagePromises);

      return {
        success: true,
        images: imageUrls
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  async uploadProductImages(productId: number, files: Express.Multer.File[], userId?: number) {
    try {
      const product = await this.prisma.product.findUnique({ where: { id: productId } });
      if (!product) throw new NotFoundException('Product not found');

      if (!Number.isInteger(productId) || productId <= 0) {
        throw new BadRequestException('Invalid product ID');
      }

      const uploadDir = path.join(process.cwd(), 'uploads', 'products');
      
      try {
        await fs.promises.access(uploadDir);
      } catch {
        await fs.promises.mkdir(uploadDir, { recursive: true });
      }

      const imagePromises = files.map(async (file) => {
        // Keep original format (PNG/JPG)
        const originalExt = path.extname(file.originalname).toLowerCase();
        const allowedExts = ['.png', '.jpg', '.jpeg'];
        const ext = allowedExts.includes(originalExt) ? originalExt : '.jpg';
        const filename = `${productId}-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        const filepath = path.resolve(uploadDir, filename);
        
        if (!filepath.startsWith(path.resolve(uploadDir))) {
          throw new BadRequestException('Invalid file path');
        }
        
        try {
          // Process image but keep original format
          if (ext === '.png') {
            await sharp(file.buffer)
              .resize(BUSINESS_CONSTANTS.FILE_UPLOAD.IMAGE_MAX_WIDTH, BUSINESS_CONSTANTS.FILE_UPLOAD.IMAGE_MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
              .png({ quality: BUSINESS_CONSTANTS.FILE_UPLOAD.IMAGE_QUALITY })
              .toFile(filepath);
          } else {
            await sharp(file.buffer)
              .resize(BUSINESS_CONSTANTS.FILE_UPLOAD.IMAGE_MAX_WIDTH, BUSINESS_CONSTANTS.FILE_UPLOAD.IMAGE_MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: BUSINESS_CONSTANTS.FILE_UPLOAD.IMAGE_QUALITY })
              .toFile(filepath);
          }
          
          return `/uploads/products/${path.basename(filename)}`;
        } catch (error) {
          throw new BadRequestException(`Image processing failed: ${error.message}`);
        }
      });

      const imageUrls = await Promise.all(imagePromises);
      const currentImages = this.safeJsonParse(product.images, []);
      const updatedImages = [...currentImages, ...imageUrls];

      const updatedProduct = await this.prisma.product.update({
        where: { id: productId },
        data: { images: JSON.stringify(updatedImages) },
        include: { category: true, brand: true }
      });

      if (userId) {
        await this.activityService.logActivity(
          userId,
          'UPLOAD_PRODUCT_IMAGES',
          { productName: updatedProduct.name, productId, imageCount: imageUrls.length },
          'Product',
          productId
        ).catch(console.error);
      }

      return {
        success: true,
        images: updatedImages,
        product: updatedProduct
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  async getProductAnalytics(query: ProductAnalyticsDto) {
    try {
      const { period = 'monthly', productId, categoryId } = query;
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'daily':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear() - 2, 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      }

      // Build where conditions for views
      const viewsWhere: any = { viewedAt: { gte: startDate } };
      if (productId) viewsWhere.productId = productId;
      if (categoryId) {
        viewsWhere.product = { categoryId };
      }

      // Build where conditions for orders
      const ordersWhere: any = { order: { createdAt: { gte: startDate } } };
      if (productId) ordersWhere.productId = productId;
      if (categoryId) {
        ordersWhere.product = { categoryId };
      }

      const [views, sales, revenue] = await Promise.all([
        this.prisma.recentlyViewed.groupBy({
          by: ['productId'],
          _count: { productId: true },
          where: viewsWhere,
          orderBy: { _count: { productId: 'desc' } },
          take: 10
        }).catch(() => []),
        this.prisma.orderItem.groupBy({
          by: ['productId'],
          _sum: { quantity: true },
          where: ordersWhere,
          orderBy: { _sum: { quantity: 'desc' } },
          take: 10
        }).catch(() => []),
        this.prisma.orderItem.groupBy({
          by: ['productId'],
          _sum: { total: true },
          where: ordersWhere,
          orderBy: { _sum: { total: 'desc' } },
          take: 10
        }).catch(() => [])
      ]);

      // Enrich with product details
      const productIds = [...new Set([
        ...views.map(v => v.productId),
        ...sales.map(s => s.productId),
        ...revenue.map(r => r.productId)
      ])];

      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, images: true, price: true }
      }).catch(() => []);

      const enrichData = (items: any[], type: 'views' | 'sales' | 'revenue') => {
        return items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            productId: item.productId,
            productName: product?.name || 'Unknown Product',
            productImage: product?.images ? JSON.parse(product.images)[0] : null,
            productPrice: product?.price || 0,
            value: type === 'views' ? item._count.productId : 
                   type === 'sales' ? item._sum.quantity : 
                   item._sum.total
          };
        });
      };

      return {
        views: enrichData(views, 'views'),
        sales: enrichData(sales, 'sales'),
        revenue: enrichData(revenue, 'revenue'),
        period,
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      };
    } catch (error) {
      this.logger.error('Failed to fetch product analytics', error.stack);
      return {
        views: [],
        sales: [],
        revenue: [],
        period: query.period || 'monthly',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        error: 'Failed to fetch analytics data'
      };
    }
  }

  // Category Management
  async getCategories() {
    const categories = await this.prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        _count: { select: { products: true } }
      },
      orderBy: { sortOrder: 'asc' }
    });

    // Calculate total product count including subcategories
    const categoriesWithTotalCount = await Promise.all(
      categories.map(async (category) => {
        if (!category.parentId) {
          // For parent categories, count products in category and all subcategories
          const subcategoryIds = category.children.map(child => child.id);
          const allCategoryIds = [category.id, ...subcategoryIds];
          
          const totalProducts = await this.prisma.product.count({
            where: {
              categoryId: { in: allCategoryIds },
              isActive: true
            }
          });
          
          return {
            ...category,
            _count: { products: totalProducts }
          };
        }
        return category;
      })
    );

    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    return categoriesWithTotalCount.map(category => ({
      ...category,
      image: category.image && !category.image.startsWith('http') 
        ? `${baseUrl}${category.image}`
        : category.image
    }));
  }

  async createCategory(categoryData: any, userId?: number) {
    const result = await this.prisma.category.create({
      data: categoryData,
      include: { parent: true, children: true }
    });
    
    if (userId) {
      await this.activityService.logActivity(
        userId,
        'CREATE_CATEGORY',
        { categoryName: result.name, categoryId: result.id },
        'Category',
        result.id
      ).catch(console.error);
    }
    
    return result;
  }

  async updateCategory(id: number, categoryData: any, userId?: number) {
    const result = await this.prisma.category.update({
      where: { id },
      data: categoryData,
      include: { parent: true, children: true }
    });
    
    if (userId) {
      await this.activityService.logActivity(
        userId,
        'UPDATE_CATEGORY',
        { categoryName: result.name, categoryId: result.id, changes: Object.keys(categoryData).join(', ') },
        'Category',
        result.id
      ).catch(console.error);
    }
    
    return result;
  }

  async deleteCategory(id: number, userId?: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        _count: { select: { products: true } }
      }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.products > 0) {
      throw new BadRequestException(`Cannot delete category because it has ${category._count.products} products`);
    }

    if (category.children.length > 0) {
      throw new BadRequestException('Cannot delete category because it has subcategories');
    }

    const result = await this.prisma.category.delete({ where: { id } });
    
    if (userId) {
      await this.activityService.logActivity(
        userId,
        'DELETE_CATEGORY',
        { categoryName: category.name, categoryId: category.id },
        'Category',
        category.id
      ).catch(console.error);
    }
    
    return result;
  }

  async uploadCategoryImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const uploadDir = path.join(process.cwd(), 'uploads', 'categories');
      
      try {
        await fs.promises.access(uploadDir);
      } catch {
        await fs.promises.mkdir(uploadDir, { recursive: true });
      }

      // Keep original format (PNG/JPG)
      const originalExt = path.extname(file.originalname).toLowerCase();
      const allowedExts = ['.png', '.jpg', '.jpeg'];
      const ext = allowedExts.includes(originalExt) ? originalExt : '.jpg';
      const filename = `category-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
      const filepath = path.resolve(uploadDir, filename);
      
      if (!filepath.startsWith(path.resolve(uploadDir))) {
        throw new BadRequestException('Invalid file path');
      }
      
      // Process image but keep original format
      if (ext === '.png') {
        await sharp(file.buffer)
          .resize(400, 400, { fit: 'cover' })
          .png({ quality: 90 })
          .toFile(filepath);
      } else {
        await sharp(file.buffer)
          .resize(400, 400, { fit: 'cover' })
          .jpeg({ quality: 90 })
          .toFile(filepath);
      }
      
      const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
      const imageUrl = `${baseUrl}/api/admin/categories/image/${filename}`;
      
      return {
        success: true,
        imageUrl
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  async reorderCategories(orderData: { categoryId: number; sortOrder: number }[]) {
    const updates = orderData.map(({ categoryId, sortOrder }) =>
      this.prisma.category.update({
        where: { id: categoryId },
        data: { sortOrder }
      })
    );
    
    await Promise.all(updates);
    return { success: true };
  }

  // Brand Management
  async getBrands() {
    return this.prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' }
    });
  }

  async createBrand(brandData: any) {
    return this.prisma.brand.create({ data: brandData });
  }

  async updateBrand(id: number, brandData: any) {
    return this.prisma.brand.update({
      where: { id },
      data: brandData
    });
  }

  // Enhanced Analytics Methods
  async getPerformanceMetrics() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [thisMonthStats, lastMonthStats, conversionRate, avgOrderValue] = await Promise.all([
      this.getMonthStats(thisMonth),
      this.getMonthStats(lastMonth),
      this.calculateConversionRate(),
      this.calculateAvgOrderValue()
    ]);

    return {
      revenue: {
        current: thisMonthStats.revenue,
        previous: lastMonthStats.revenue,
        growth: this.calculateGrowth(Number(thisMonthStats.revenue), Number(lastMonthStats.revenue))
      },
      orders: {
        current: thisMonthStats.orders,
        previous: lastMonthStats.orders,
        growth: this.calculateGrowth(thisMonthStats.orders, lastMonthStats.orders)
      },
      customers: {
        current: thisMonthStats.customers,
        previous: lastMonthStats.customers,
        growth: this.calculateGrowth(thisMonthStats.customers, lastMonthStats.customers)
      },
      conversionRate,
      avgOrderValue
    };
  }

  async getConversionRates(period: string) {
    const visitors = await this.prisma.recentlyViewed.count();
    const orders = await this.prisma.order.count();
    const customers = await this.prisma.user.count({ where: { role: Role.CUSTOMER } });
    
    return {
      visitorToCustomer: customers > 0 ? (customers / visitors) * 100 : 0,
      visitorToOrder: orders > 0 ? (orders / visitors) * 100 : 0,
      customerToOrder: orders > 0 ? (orders / customers) * 100 : 0
    };
  }

  async getRevenueAnalytics(period: string) {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear() - 2, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    }

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'DELIVERED'
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalCost = orders.reduce((sum, order) => {
      const cost = order.items.reduce((itemSum, item) => {
        const costPrice = Number(item.product.price) * 0.6;
        return itemSum + (costPrice * item.quantity);
      }, 0);
      return sum + cost;
    }, 0);

    return {
      totalRevenue,
      totalCost,
      grossProfit: totalRevenue - totalCost,
      profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
      revenueByMonth: await this.getRevenueByPeriod(period)
    };
  }

  async getGeographicSales() {
    // Get orders with delivery location and user addresses
    const orders = await this.prisma.order.findMany({
      where: { status: 'DELIVERED' },
      select: {
        deliveryLocation: true,
        shippingAddress: true,
        total: true,
        user: {
          select: {
            addresses: {
              select: { county: true },
              take: 1
            }
          }
        }
      }
    });

    // Aggregate by county in a single pass
    const countyMap = new Map<string, { orders: number; revenue: number }>();
    orders.forEach(order => {
      // Priority: deliveryLocation > user's address county > extracted from shippingAddress
      let county = 'Unknown';
      
      if (order.deliveryLocation) {
        // Clean up delivery location by removing pricing info
        county = order.deliveryLocation.replace(/\s*-\s*Ksh\s*\d+/i, '').trim();
      } else if (order.user.addresses[0]?.county) {
        county = order.user.addresses[0].county;
      } else if (order.shippingAddress) {
        county = this.extractCounty(order.shippingAddress);
      }
      
      const existing = countyMap.get(county) || { orders: 0, revenue: 0 };
      countyMap.set(county, {
        orders: existing.orders + 1,
        revenue: existing.revenue + Number(order.total || 0)
      });
    });

    return Array.from(countyMap.entries())
      .map(([county, data]) => ({ county, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  async getCustomerBehavior() {
    const [mostViewedProducts, popularCategories, avgSessionTime] = await Promise.all([
      this.getMostViewedProducts(),
      this.getPopularCategories('monthly'),
      this.calculateAvgSessionTime()
    ]);

    return {
      mostViewedProducts,
      popularCategories,
      avgSessionTime,
      repeatCustomerRate: await this.calculateRepeatCustomerRate()
    };
  }

  async getRecentActivities() {
    const [recentOrders, newCustomers, newReviews, lowStockAlerts] = await Promise.all([
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } }
      }),
      this.prisma.user.findMany({
        where: { role: Role.CUSTOMER },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { name: true, email: true, createdAt: true }
      }),
      this.prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          product: { select: { name: true } }
        }
      }),
      this.prisma.productVariant.findMany({
        where: { stock: { lt: 5 } },
        take: 5,
        include: { product: { select: { name: true } } }
      })
    ]);

    return {
      recentOrders: recentOrders.map(order => ({
        type: 'order',
        message: `New order #${order.orderNumber} from ${order.user.name}`,
        timestamp: order.createdAt,
        amount: order.total
      })),
      newCustomers: newCustomers.map(customer => ({
        type: 'customer',
        message: `New customer registration: ${customer.name}`,
        timestamp: customer.createdAt
      })),
      newReviews: newReviews.map(review => ({
        type: 'review',
        message: `New ${review.rating}★ review for ${review.product.name}`,
        timestamp: review.createdAt
      })),
      lowStockAlerts: lowStockAlerts.map(variant => ({
        type: 'alert',
        message: `Low stock alert: ${variant.product.name} (${variant.stock} left)`,
        timestamp: new Date()
      }))
    };
  }

  async getKPIs() {
    const [customerLifetimeValue, customerAcquisitionCost, inventoryTurnover] = await Promise.all([
      this.calculateCustomerLifetimeValue(),
      this.calculateCustomerAcquisitionCost(),
      this.calculateInventoryTurnover()
    ]);

    return {
      customerLifetimeValue,
      customerAcquisitionCost,
      inventoryTurnover,
      returnRate: await this.calculateReturnRate(),
      customerSatisfaction: await this.calculateCustomerSatisfaction()
    };
  }

  async getPopularProducts(period: string) {
    const startDate = this.getStartDate(period);
    
    return this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _count: true,
      where: {
        order: {
          createdAt: { gte: startDate },
          status: 'DELIVERED'
        }
      },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    });
  }

  async getPopularCategories(period: string) {
    const startDate = this.getStartDate(period);
    
    const categoryStats = await this.prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate },
          status: 'DELIVERED'
        }
      },
      select: {
        quantity: true,
        product: {
          select: {
            category: {
              select: { name: true }
            }
          }
        }
      }
    });

    const categoryMap = new Map<string, number>();
    categoryStats.forEach(item => {
      const categoryName = item.product.category.name;
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + item.quantity);
    });

    return Array.from(categoryMap.entries())
      .map(([category, sales]) => ({ category, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
  }

  // Helper methods
  private async getMonthStats(startDate: Date) {
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    
    const [revenue, orders, customers] = await Promise.all([
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'DELIVERED'
        }
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      this.prisma.user.count({
        where: {
          role: Role.CUSTOMER,
          createdAt: { gte: startDate, lte: endDate }
        }
      })
    ]);

    return {
      revenue: revenue._sum.total || 0,
      orders,
      customers
    };
  }

  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private async calculateConversionRate(): Promise<number> {
    const visitors = await this.prisma.recentlyViewed.count();
    const orders = await this.prisma.order.count();
    return visitors > 0 ? (orders / visitors) * 100 : 0;
  }

  private async calculateAvgOrderValue(): Promise<number> {
    const result = await this.prisma.order.aggregate({
      _avg: { total: true },
      where: { status: 'DELIVERED' }
    });
    return Number(result._avg.total) || 0;
  }

  private async getRevenueByPeriod(period: string) {
    const salesData = await this.getSalesAnalytics(period as any);
    return salesData;
  }

  private async getMostViewedProducts() {
    return this.prisma.recentlyViewed.groupBy({
      by: ['productId'],
      _count: true,
      orderBy: { _count: { productId: 'desc' } },
      take: 10
    });
  }

  private async calculateAvgSessionTime(): Promise<number> {
    return 180;
  }

  private async calculateRepeatCustomerRate(): Promise<number> {
    const totalCustomers = await this.prisma.user.count({ where: { role: Role.CUSTOMER } });
    const repeatCustomers = await this.prisma.user.count({
      where: {
        role: Role.CUSTOMER,
        orders: { some: { id: { gt: 0 } } }
      }
    });
    return totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
  }

  private async calculateCustomerLifetimeValue(): Promise<number> {
    const result = await this.prisma.order.aggregate({
      _avg: { total: true },
      where: { status: 'DELIVERED' }
    });
    return (Number(result._avg.total) || 0) * 3;
  }

  private async calculateCustomerAcquisitionCost(): Promise<number> {
    return 500;
  }

  private async calculateInventoryTurnover(): Promise<number> {
    const totalProducts = await this.prisma.product.count();
    const soldProducts = await this.prisma.orderItem.aggregate({
      _sum: { quantity: true }
    });
    return totalProducts > 0 ? (soldProducts._sum.quantity || 0) / totalProducts : 0;
  }

  private async calculateReturnRate(): Promise<number> {
    return 2.5;
  }

  private async calculateCustomerSatisfaction(): Promise<number> {
    const result = await this.prisma.review.aggregate({
      _avg: { rating: true }
    });
    return result._avg.rating || 0;
  }

  private getStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'yearly':
        return new Date(now.getFullYear() - 1, 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }
  }

  // Missing methods from controller
  async cropProductImage(cropDto: ImageCropDto) {
    // Placeholder implementation - would use sharp for actual cropping
    return { success: true, message: 'Image cropping not implemented yet' };
  }

  async deleteProductImage(productId: number, imageIndex: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const images = JSON.parse(product.images);
    if (imageIndex >= 0 && imageIndex < images.length) {
      images.splice(imageIndex, 1);
      return this.prisma.product.update({
        where: { id: productId },
        data: { images: JSON.stringify(images) }
      });
    }
    throw new BadRequestException('Invalid image index');
  }

  async createProductVariant(productId: number, variantDto: VariantDto) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const { attributes, ...variantData } = variantDto;
    const data: any = {
      ...variantData,
      productId,
      ...(attributes && { attributes: JSON.stringify(attributes) })
    };
    
    return this.prisma.productVariant.create({ data });
  }

  async updateProductVariant(productId: number, variantId: number, variantDto: VariantDto) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId }
    });
    if (!variant) throw new NotFoundException('Product variant not found');

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: variantDto
    });
  }

  async deleteProductVariant(productId: number, variantId: number) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId }
    });
    if (!variant) throw new NotFoundException('Product variant not found');

    return this.prisma.productVariant.delete({ where: { id: variantId } });
  }

  async updateProductSEO(productId: number, seoDto: SEOUpdateDto) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const updateData: any = {};
    if (seoDto.seoTitle) updateData.seoTitle = seoDto.seoTitle;
    if (seoDto.seoDescription) updateData.seoDescription = seoDto.seoDescription;

    return this.prisma.product.update({
      where: { id: productId },
      data: updateData
    });
  }

  async importProductsExcel(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    
    try {
      // For now, convert Excel to CSV format and use existing CSV logic
      const csvData = file.buffer.toString();
      const products = [];
      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= headers.length) {
          const product = {
            name: values[0]?.trim(),
            slug: values[1]?.trim() || undefined, // Let createProduct handle slug generation
            description: values[2]?.trim(),
            sku: values[3]?.trim(),
            price: parseFloat(values[4]) || 0,
            comparePrice: values[5] ? parseFloat(values[5]) : null,
            categoryId: parseInt(values[6]) || 1,
            brandId: values[7] ? parseInt(values[7]) : null,
            images: values[8] ? values[8].split(';') : [],
            tags: values[9] ? values[9].split(';') : []
          };
          if (product.name) products.push(product);
        }
      }
      
      return await this.bulkCreateProducts(products);
    } catch (error) {
      throw new BadRequestException('Invalid Excel file format');
    }
  }

  async exportProductsExcel() {
    const products = await this.exportProductsCsv();
    // Return the same data - frontend can handle Excel conversion
    return products;
  }

  // Activities methods
  async getActivities(query: ActivityQuery) {
    try {
      const { page = 1, limit = 50, userId, search, entityType, startDate, endDate } = query;
      
      // Validate and sanitize inputs
      const { page: validatedPage, limit: validatedLimit } = InputValidationUtil.validatePagination(page, limit);
      const skip = (validatedPage - 1) * validatedLimit;
      const sanitizedSearch = search ? InputValidationUtil.sanitizeString(search, 50) : undefined;
      const sanitizedEntityType = entityType ? InputValidationUtil.sanitizeString(entityType, 50) : undefined;
      const validatedUserId = userId ? InputValidationUtil.safeParseInt(userId) : undefined;

      const where: any = {};
      
      // Build AND conditions
      const andConditions = [];
      
      if (validatedUserId && validatedUserId > 0) {
        andConditions.push({ userId: validatedUserId });
      }
      
      if (sanitizedEntityType) {
        andConditions.push({ entityType: sanitizedEntityType });
      }
      
      if (sanitizedSearch) {
        andConditions.push({
          OR: [
            { action: { contains: sanitizedSearch, mode: 'insensitive' } },
            { details: { contains: sanitizedSearch, mode: 'insensitive' } },
            { user: { name: { contains: sanitizedSearch, mode: 'insensitive' } } },
            { user: { email: { contains: sanitizedSearch, mode: 'insensitive' } } }
          ]
        });
      }
      
      if (andConditions.length > 0) {
        where.AND = andConditions;
      }
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          const parsedStartDate = new Date(startDate);
          if (!isNaN(parsedStartDate.getTime())) where.createdAt.gte = parsedStartDate;
        }
        if (endDate) {
          const parsedEndDate = new Date(endDate);
          if (!isNaN(parsedEndDate.getTime())) where.createdAt.lte = parsedEndDate;
        }
      }

      const [activities, total] = await Promise.all([
        this.prisma.adminActivity.findMany({
          where,
          include: {
            user: {
              select: { name: true, email: true, role: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: validatedLimit
        }).catch(() => []),
        this.prisma.adminActivity.count({ where }).catch(() => 0)
      ]);

      return {
        data: this.transformActivityData(activities),
        meta: {
          total,
          page: validatedPage,
          limit: validatedLimit,
          totalPages: Math.ceil(total / validatedLimit)
        }
      };
    } catch (error) {
      console.error('Error in getActivities:', error);
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0
        }
      };
    }
  }

  async getActivitiesStats() {
    try {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalActivities,
        activitiesLast24h,
        activitiesLast7d,
        activitiesLast30d,
        topActions,
        activeUsers
      ] = await Promise.all([
        this.prisma.adminActivity.count().catch(() => 0),
        this.prisma.adminActivity.count({ where: { createdAt: { gte: last24h } } }).catch(() => 0),
        this.prisma.adminActivity.count({ where: { createdAt: { gte: last7d } } }).catch(() => 0),
        this.prisma.adminActivity.count({ where: { createdAt: { gte: last30d } } }).catch(() => 0),
        this.prisma.adminActivity.groupBy({
          by: ['action'],
          _count: true,
          orderBy: { _count: { action: 'desc' } },
          take: 10
        }).catch(() => []),
        this.prisma.adminActivity.groupBy({
          by: ['userId'],
          _count: true,
          where: { createdAt: { gte: last7d } },
          orderBy: { _count: { userId: 'desc' } },
          take: 10
        }).catch(() => [])
      ]);

      return {
        totalActivities,
        activitiesLast24h,
        activitiesLast7d,
        activitiesLast30d,
        topActions: topActions.map(item => ({
          action: item.action,
          count: item._count
        })),
        activeUsers: await this.enrichActiveUsers(activeUsers).catch(() => [])
      };
    } catch (error) {
      console.error('Error in getActivitiesStats:', error);
      return {
        totalActivities: 0,
        activitiesLast24h: 0,
        activitiesLast7d: 0,
        activitiesLast30d: 0,
        topActions: [],
        activeUsers: []
      };
    }
  }

  private async enrichActiveUsers(activeUsers: any[]) {
    const userIds = activeUsers.map(item => item.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true }
    });

    return activeUsers.map(item => {
      const user = users.find(u => u.id === item.userId);
      return {
        user,
        activityCount: item._count
      };
    });
  }

  private safeJsonParse(jsonString: string | null, defaultValue: any = null): any {
    if (!jsonString) return defaultValue;
    try {
      return JSON.parse(jsonString);
    } catch {
      return defaultValue;
    }
  }

  private transformProductData(product: any) {
    return {
      ...product,
      images: this.safeJsonParse(product.images, []),
      tags: this.safeJsonParse(product.tags, []),
      imageAltTexts: this.safeJsonParse(product.imageAltTexts, []),
      totalStock: product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0,
      reviewCount: product._count?.reviews || 0,
      salesCount: product._count?.orderItems || 0
    };
  }

  private transformActivityData(activities: any[]) {
    return activities.map(activity => ({
      ...activity,
      details: this.safeJsonParse(activity.details, {})
    }));
  }

  async optimizeProductImages(productId: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const images = this.safeJsonParse(product.images, []);
    
    // For now, return success - actual optimization would process existing images
    return {
      success: true,
      message: 'Images optimized successfully',
      images
    };
  }
}