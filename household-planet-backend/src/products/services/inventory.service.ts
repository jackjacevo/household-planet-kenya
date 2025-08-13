import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async updateStock(productId: string, variantId: string | null, quantity: number, operation: 'add' | 'subtract') {
    const updateData = {
      stock: operation === 'add' ? { increment: quantity } : { decrement: quantity }
    };

    if (variantId) {
      const variant = await this.prisma.productVariant.update({
        where: { id: variantId },
        data: updateData
      });
      
      await this.checkLowStock(null, variantId);
      return variant;
    } else {
      const product = await this.prisma.product.update({
        where: { id: productId },
        data: updateData
      });
      
      await this.checkLowStock(productId, null);
      return product;
    }
  }

  async checkLowStock(productId?: string, variantId?: string) {
    if (variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { product: true }
      });

      if (variant && variant.stock <= variant.lowStockThreshold) {
        await this.createInventoryAlert(
          null,
          variantId,
          variant.stock === 0 ? 'out_of_stock' : 'low_stock',
          `${variant.product.name} - ${variant.name} is ${variant.stock === 0 ? 'out of stock' : 'running low'} (${variant.stock} remaining)`
        );
      }
    }

    if (productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: productId }
      });

      if (product && product.trackInventory && product.stock <= product.lowStockThreshold) {
        await this.createInventoryAlert(
          productId,
          null,
          product.stock === 0 ? 'out_of_stock' : 'low_stock',
          `${product.name} is ${product.stock === 0 ? 'out of stock' : 'running low'} (${product.stock} remaining)`
        );
      }
    }
  }

  private async createInventoryAlert(productId: string | null, variantId: string | null, type: string, message: string) {
    await this.prisma.inventoryAlert.create({
      data: {
        productId,
        variantId,
        type,
        message
      }
    });
  }

  async getInventoryAlerts(isRead?: boolean) {
    return this.prisma.inventoryAlert.findMany({
      where: isRead !== undefined ? { isRead } : {},
      orderBy: { createdAt: 'desc' }
    });
  }

  async markAlertAsRead(alertId: string) {
    return this.prisma.inventoryAlert.update({
      where: { id: alertId },
      data: { isRead: true }
    });
  }

  async getLowStockProducts() {
    // Get all products and filter in application
    const allProducts = await this.prisma.product.findMany({
      where: { trackInventory: true },
      include: { category: true }
    });

    const allVariants = await this.prisma.productVariant.findMany({
      include: { product: { include: { category: true } } }
    });

    const lowStockProducts = allProducts.filter(p => p.stock <= p.lowStockThreshold);
    const lowStockVariants = allVariants.filter(v => v.stock <= v.lowStockThreshold);

    return {
      products: lowStockProducts.map(p => ({
        ...p,
        images: p.images ? JSON.parse(p.images) : []
      })),
      variants: lowStockVariants.map(v => ({
        ...v,
        product: {
          ...v.product,
          images: v.product.images ? JSON.parse(v.product.images) : []
        }
      }))
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkAllInventoryLevels() {
    const allProducts = await this.prisma.product.findMany({
      where: { trackInventory: true },
      select: { id: true, stock: true, lowStockThreshold: true }
    });

    const allVariants = await this.prisma.productVariant.findMany({
      select: { id: true, stock: true, lowStockThreshold: true }
    });

    const lowStockProducts = allProducts.filter(p => p.stock <= p.lowStockThreshold);
    const lowStockVariants = allVariants.filter(v => v.stock <= v.lowStockThreshold);

    for (const product of lowStockProducts) {
      await this.checkLowStock(product.id, null);
    }

    for (const variant of lowStockVariants) {
      await this.checkLowStock(null, variant.id);
    }
  }
}