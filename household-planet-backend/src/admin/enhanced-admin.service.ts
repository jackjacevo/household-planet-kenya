import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ImageCropDto, VariantDto, SEOUpdateDto } from './dto/bulk-product.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
// import * as xlsx from 'xlsx'; // Commented out until xlsx is properly installed

@Injectable()
export class EnhancedAdminService {
  constructor(private prisma: PrismaService) {}

  // Enhanced Image Management
  async cropProductImage(cropDto: ImageCropDto) {
    const { imageUrl, cropData } = cropDto;
    const imagePath = path.join(process.cwd(), 'uploads', imageUrl.replace('/uploads/', ''));
    
    if (!fs.existsSync(imagePath)) {
      throw new NotFoundException('Image not found');
    }

    const croppedFilename = `cropped-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
    const croppedPath = path.join(path.dirname(imagePath), croppedFilename);

    await sharp(imagePath)
      .extract({
        left: Math.round(cropData.x),
        top: Math.round(cropData.y),
        width: Math.round(cropData.width),
        height: Math.round(cropData.height)
      })
      .webp({ quality: 85 })
      .toFile(croppedPath);

    return { imageUrl: `/uploads/products/${croppedFilename}` };
  }

  async deleteProductImage(productId: number, imageIndex: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const images = JSON.parse(product.images);
    if (imageIndex >= images.length) throw new BadRequestException('Invalid image index');

    const imageToDelete = images[imageIndex];
    const imagePath = path.join(process.cwd(), 'uploads', imageToDelete.replace('/uploads/', ''));
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    images.splice(imageIndex, 1);
    
    return this.prisma.product.update({
      where: { id: productId },
      data: { images: JSON.stringify(images) }
    });
  }

  async optimizeProductImages(productId: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const images = JSON.parse(product.images);
    const optimizedImages = [];

    for (const imageUrl of images) {
      const imagePath = path.join(process.cwd(), 'uploads', imageUrl.replace('/uploads/', ''));
      if (fs.existsSync(imagePath)) {
        const optimizedFilename = `opt-${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
        const optimizedPath = path.join(path.dirname(imagePath), optimizedFilename);

        await sharp(imagePath)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(optimizedPath);

        optimizedImages.push(`/uploads/products/${optimizedFilename}`);
      }
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { images: JSON.stringify(optimizedImages) }
    });
  }

  // Variant Management
  async createProductVariant(productId: number, variantDto: VariantDto) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.productVariant.create({
      data: {
        ...variantDto,
        productId,
        attributes: JSON.stringify(variantDto.attributes || {})
      }
    });
  }

  async updateProductVariant(productId: number, variantId: number, variantDto: VariantDto) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId }
    });
    if (!variant) throw new NotFoundException('Variant not found');

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...variantDto,
        attributes: JSON.stringify(variantDto.attributes || {})
      }
    });
  }

  async deleteProductVariant(productId: number, variantId: number) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId }
    });
    if (!variant) throw new NotFoundException('Variant not found');

    return this.prisma.productVariant.delete({ where: { id: variantId } });
  }

  async getVariantStockReport() {
    const variants = await this.prisma.productVariant.findMany({
      include: {
        product: {
          select: { name: true, category: { select: { name: true } } }
        }
      },
      orderBy: { stock: 'asc' }
    });

    return variants.map(variant => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      stock: variant.stock,
      price: variant.price,
      productName: variant.product.name,
      category: variant.product.category.name,
      status: variant.stock === 0 ? 'Out of Stock' : variant.stock < 10 ? 'Low Stock' : 'In Stock'
    }));
  }

  // SEO Management
  async updateProductSEO(productId: number, seoDto: SEOUpdateDto) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.update({
      where: { id: productId },
      data: seoDto
    });
  }

  async bulkUpdateSEO(productIds: number[], seoDto: SEOUpdateDto) {
    return this.prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: seoDto
    });
  }

  async generateSEOSuggestions(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { category: true, brand: true }
    });

    if (!product) throw new NotFoundException('Product not found');

    const suggestions = {
      seoTitle: `${product.name} - ${product.category.name} | Household Planet Kenya`,
      seoDescription: `Buy ${product.name} online in Kenya. ${product.shortDescription || product.description?.substring(0, 150)}. Fast delivery across Kenya.`,
      metaKeywords: [
        product.name.toLowerCase(),
        product.category.name.toLowerCase(),
        product.brand?.name?.toLowerCase(),
        'kenya',
        'household items',
        'online shopping'
      ].filter(Boolean).join(', ')
    };

    return suggestions;
  }

  // Excel Import/Export
  async importProductsExcel(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    
    // Placeholder implementation - xlsx library not available
    throw new BadRequestException('Excel import not implemented yet. Please use CSV import.');
    
    /*
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const products = data.map((row: any) => ({
      name: row.name || row.Name,
      slug: row.slug || row.Slug || (row.name || row.Name).toLowerCase().replace(/\s+/g, '-'),
      description: row.description || row.Description,
      sku: row.sku || row.SKU,
      price: parseFloat(row.price || row.Price),
      comparePrice: row.comparePrice ? parseFloat(row.comparePrice) : null,
      categoryId: parseInt(row.categoryId || row.CategoryId),
      brandId: row.brandId ? parseInt(row.brandId) : null,
      images: row.images ? row.images.split(',') : [],
      tags: row.tags ? row.tags.split(',') : []
    }));

    const results = [];
    for (const product of products) {
      try {
        const created = await this.prisma.product.create({
          data: {
            ...product,
            images: JSON.stringify(product.images),
            tags: JSON.stringify(product.tags)
          }
        });
        results.push(created);
      } catch (error) {
        continue;
      }
    }

    return { count: results.length, products: results };
    */
  }

  async exportProductsExcel() {
    const products = await this.prisma.product.findMany({
      include: { category: true, brand: true, variants: true }
    });

    const exportData = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      sku: product.sku,
      price: product.price,
      comparePrice: product.comparePrice,
      categoryId: product.categoryId,
      categoryName: product.category.name,
      brandId: product.brandId,
      brandName: product.brand?.name,
      images: JSON.parse(product.images).join(','),
      tags: JSON.parse(product.tags).join(','),
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      totalStock: product.variants.reduce((sum, v) => sum + v.stock, 0),
      createdAt: product.createdAt
    }));
    
    // Placeholder implementation - xlsx library not available
    throw new BadRequestException('Excel export not implemented yet. Please use CSV export.');
    
    /*
    const worksheet = xlsx.utils.json_to_sheet(exportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');
    
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
    */
  }

  // Enhanced Analytics
  async getProductConversionRates(productId?: number) {
    const where = productId ? { productId } : {};
    
    const [views, addToCarts, purchases] = await Promise.all([
      this.prisma.recentlyViewed.count({ where }),
      // this.prisma.cartItem.count({ where }), // CartItem model not available
      0, // Placeholder for cart items count
      this.prisma.orderItem.count({ where: { ...where, order: { status: 'DELIVERED' } } })
    ]);

    return {
      viewToCart: views > 0 ? (addToCarts / views) * 100 : 0,
      cartToPurchase: addToCarts > 0 ? (purchases / addToCarts) * 100 : 0,
      viewToPurchase: views > 0 ? (purchases / views) * 100 : 0
    };
  }

  async getProductPerformanceMetrics(productId: number, period: string = 'monthly') {
    const startDate = this.getStartDate(period);
    
    const [sales, revenue, views, reviews] = await Promise.all([
      this.prisma.orderItem.aggregate({
        _sum: { quantity: true },
        where: {
          productId,
          order: { createdAt: { gte: startDate }, status: 'DELIVERED' }
        }
      }),
      this.prisma.orderItem.aggregate({
        _sum: { total: true },
        where: {
          productId,
          order: { createdAt: { gte: startDate }, status: 'DELIVERED' }
        }
      }),
      this.prisma.recentlyViewed.count({
        where: { productId }
      }),
      this.prisma.review.aggregate({
        _avg: { rating: true },
        _count: true,
        where: { productId, createdAt: { gte: startDate } }
      })
    ]);

    return {
      sales: sales._sum.quantity || 0,
      revenue: revenue._sum.total || 0,
      views,
      avgRating: reviews._avg.rating || 0,
      reviewCount: reviews._count
    };
  }

  async getCategoryPerformance() {
    const categories = await this.prisma.category.findMany({
      include: {
        products: {
          include: {
            orderItems: {
              where: { order: { status: 'DELIVERED' } }
            },
            _count: { select: { recentlyViewed: true } }
          }
        }
      }
    });

    return categories.map(category => {
      const totalSales = category.products.reduce((sum, product) => 
        sum + product.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      );
      const totalRevenue = category.products.reduce((sum, product) => 
        sum + product.orderItems.reduce((itemSum, item) => itemSum + Number(item.total), 0), 0
      );
      const totalViews = category.products.reduce((sum, product) => 
        sum + product._count.recentlyViewed, 0
      );

      return {
        id: category.id,
        name: category.name,
        productCount: category.products.length,
        totalSales,
        totalRevenue,
        totalViews,
        conversionRate: totalViews > 0 ? (totalSales / totalViews) * 100 : 0
      };
    });
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
}