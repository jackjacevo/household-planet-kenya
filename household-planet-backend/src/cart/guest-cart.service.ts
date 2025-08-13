import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface GuestCartItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

@Injectable()
export class GuestCartService {
  constructor(private prisma: PrismaService) {}

  async validateGuestCart(items: GuestCartItem[]) {
    const validatedItems = [];
    let total = 0;

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true }
      });

      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }

      let price = product.price;
      let availableStock = product.stock;

      if (item.variantId) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (!variant) {
          throw new BadRequestException(`Variant ${item.variantId} not found`);
        }
        price = variant.price;
        availableStock = variant.stock;
      }

      if (item.quantity > availableStock) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      const itemTotal = price * item.quantity;
      total += itemTotal;

      validatedItems.push({
        ...item,
        product,
        variant: item.variantId ? product.variants.find(v => v.id === item.variantId) : null,
        price,
        total: itemTotal
      });
    }

    return {
      items: validatedItems,
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  async mergeGuestCartWithUserCart(userId: string, guestCartItems: GuestCartItem[]) {
    if (!guestCartItems || guestCartItems.length === 0) {
      return;
    }

    for (const item of guestCartItems) {
      // Check if item already exists in user cart
      const existingItem = await this.prisma.cart.findUnique({
        where: {
          userId_productId_variantId: {
            userId,
            productId: item.productId,
            variantId: item.variantId || null
          }
        }
      });

      if (existingItem) {
        // Update quantity
        await this.prisma.cart.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + item.quantity }
        });
      } else {
        // Create new cart item
        await this.prisma.cart.create({
          data: {
            userId,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity
          }
        });
      }
    }
  }
}