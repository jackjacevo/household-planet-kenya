import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as csv from 'csv-parser';
import * as fs from 'fs';

@Injectable()
export class ProductManagementService {
  constructor(private prisma: PrismaService) {}

  async createProduct(data: any) {
    return this.prisma.product.create({
      data: {
        ...data,
        slug: this.generateSlug(data.name),
        sku: data.sku || this.generateSKU()
      },
      include: { category: true, variants: true }
    });
  }

  async updateProduct(id: string, data: any) {
    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        slug: data.name ? this.generateSlug(data.name) : undefined
      },
      include: { category: true, variants: true }
    });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  async bulkUpdateProducts(updates: Array<{ id: string; data: any }>) {
    const results = [];
    for (const update of updates) {
      const result = await this.prisma.product.update({
        where: { id: update.id },
        data: update.data
      });
      results.push(result);
    }
    return results;
  }

  async bulkDeleteProducts(ids: string[]) {
    return this.prisma.product.deleteMany({
      where: { id: { in: ids } }
    });
  }

  async importProductsFromCSV(filePath: string) {
    const products = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          products.push({
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            stock: parseInt(row.stock),
            categoryId: row.categoryId,
            sku: row.sku || this.generateSKU()
          });
        })
        .on('end', async () => {
          try {
            const results = [];
            for (const product of products) {
              const created = await this.prisma.product.create({
                data: {
                  ...product,
                  slug: this.generateSlug(product.name)
                }
              });
              results.push(created);
            }
            resolve(results);
          } catch (error) {
            reject(error);
          }
        });
    });
  }

  async exportProductsToCSV() {
    const products = await this.prisma.product.findMany({
      include: { category: true }
    });
    
    const csvData = products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category.name,
      sku: p.sku,
      isActive: p.isActive
    }));
    
    return csvData;
  }

  async createVariant(productId: string, data: any) {
    return this.prisma.productVariant.create({
      data: {
        ...data,
        productId,
        sku: data.sku || this.generateSKU()
      }
    });
  }

  async updateVariant(id: string, data: any) {
    return this.prisma.productVariant.update({
      where: { id },
      data
    });
  }

  async deleteVariant(id: string) {
    return this.prisma.productVariant.delete({ where: { id } });
  }

  async createCategory(data: any) {
    return this.prisma.category.create({
      data: {
        ...data,
        slug: this.generateSlug(data.name)
      }
    });
  }

  async updateCategory(id: string, data: any) {
    return this.prisma.category.update({
      where: { id },
      data: {
        ...data,
        slug: data.name ? this.generateSlug(data.name) : undefined
      }
    });
  }

  async reorderCategories(orders: Array<{ id: string; sortOrder: number }>) {
    const results = [];
    for (const order of orders) {
      const result = await this.prisma.category.update({
        where: { id: order.id },
        data: { sortOrder: order.sortOrder }
      });
      results.push(result);
    }
    return results;
  }

  async getProductAnalytics(productId: string) {
    const [product, orderItems, reviews] = await Promise.all([
      this.prisma.product.findUnique({
        where: { id: productId },
        include: { category: true }
      }),
      this.prisma.orderItem.findMany({
        where: { productId },
        include: { order: true }
      }),
      this.prisma.review.findMany({
        where: { productId }
      })
    ]);

    const totalSales = orderItems.reduce((sum, item) => sum + item.total, 0);
    const totalQuantitySold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    return {
      product,
      analytics: {
        totalSales,
        totalQuantitySold,
        viewCount: product.viewCount,
        averageRating,
        totalReviews: reviews.length,
        conversionRate: product.viewCount > 0 ? (totalQuantitySold / product.viewCount * 100) : 0
      }
    };
  }

  private generateSlug(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private generateSKU(): string {
    return 'HP' + Date.now().toString(36).toUpperCase();
  }
}