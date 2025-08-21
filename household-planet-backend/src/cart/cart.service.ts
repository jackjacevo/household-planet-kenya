import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: number) {
    const cartItems = await this.prisma.cart.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true, brand: true }
        },
        variant: true
      }
    });

    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.variant ? item.variant.price : item.product.price;
      return sum + (Number(price) * item.quantity);
    }, 0);

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items: cartItems.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: JSON.parse(item.product.images),
          tags: JSON.parse(item.product.tags)
        },
        itemTotal: Number(item.variant ? item.variant.price : item.product.price) * item.quantity
      })),
      summary: {
        subtotal,
        totalItems,
        estimatedShipping: subtotal > 5000 ? 0 : 200, // Free shipping over 5000
        total: subtotal + (subtotal > 5000 ? 0 : 200)
      }
    };
  }

  async addToCart(userId: number, dto: AddToCartDto) {
    // Validate product exists and is active
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, isActive: true },
      include: { variants: true }
    });

    if (!product) {
      throw new NotFoundException('Product not found or inactive');
    }

    // Validate variant if specified
    if (dto.variantId) {
      const variant = product.variants.find(v => v.id === dto.variantId);
      if (!variant) {
        throw new NotFoundException('Product variant not found');
      }
      if (variant.stock < dto.quantity) {
        throw new BadRequestException(`Only ${variant.stock} items available in stock`);
      }
    }

    const existing = await this.prisma.cart.findUnique({
      where: {
        userId_productId_variantId: {
          userId,
          productId: dto.productId,
          variantId: dto.variantId || null
        }
      }
    });

    if (existing) {
      const newQuantity = existing.quantity + dto.quantity;
      
      // Check stock for updated quantity
      if (dto.variantId) {
        const variant = product.variants.find(v => v.id === dto.variantId);
        if (variant && variant.stock < newQuantity) {
          throw new BadRequestException(`Only ${variant.stock} items available in stock`);
        }
      }

      return this.prisma.cart.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
        include: { product: true, variant: true }
      });
    }

    return this.prisma.cart.create({
      data: { userId, ...dto },
      include: { product: true, variant: true }
    });
  }

  async updateCart(userId: number, cartId: number, dto: UpdateCartDto) {
    const cart = await this.prisma.cart.findFirst({
      where: { id: cartId, userId },
      include: { product: true, variant: true }
    });

    if (!cart) throw new NotFoundException('Cart item not found');

    // Validate stock if updating quantity
    if (dto.quantity > 0 && cart.variant) {
      if (cart.variant.stock < dto.quantity) {
        throw new BadRequestException(`Only ${cart.variant.stock} items available in stock`);
      }
    }

    if (dto.quantity <= 0) {
      return this.prisma.cart.delete({ where: { id: cartId } });
    }

    return this.prisma.cart.update({
      where: { id: cartId },
      data: { quantity: dto.quantity },
      include: { product: true, variant: true }
    });
  }

  async removeFromCart(userId: number, cartId: number) {
    const cart = await this.prisma.cart.findFirst({
      where: { id: cartId, userId }
    });

    if (!cart) throw new NotFoundException('Cart item not found');

    return this.prisma.cart.delete({ where: { id: cartId } });
  }

  async clearCart(userId: number) {
    return this.prisma.cart.deleteMany({ where: { userId } });
  }

  async saveForLater(userId: number, cartId: number) {
    const cart = await this.prisma.cart.findFirst({
      where: { id: cartId, userId },
      include: { product: true }
    });

    if (!cart) throw new NotFoundException('Cart item not found');

    await this.prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId,
          productId: cart.productId
        }
      },
      create: {
        userId,
        productId: cart.productId
      },
      update: {}
    });

    return this.prisma.cart.delete({ where: { id: cartId } });
  }

  async getCartSummary(userId: number) {
    const cartItems = await this.prisma.cart.findMany({
      where: { userId },
      include: {
        product: true,
        variant: true
      }
    });

    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.variant ? item.variant.price : item.product.price;
      return sum + (Number(price) * item.quantity);
    }, 0);

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const shippingCost = subtotal > 5000 ? 0 : 200;

    return {
      subtotal,
      totalItems,
      shippingCost,
      total: subtotal + shippingCost,
      freeShippingThreshold: 5000,
      freeShippingEligible: subtotal >= 5000
    };
  }

  async validateCartForCheckout(userId: number) {
    const cartItems = await this.prisma.cart.findMany({
      where: { userId },
      include: {
        product: true,
        variant: true
      }
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const issues = [];
    for (const item of cartItems) {
      if (!item.product || !item.product.isActive) {
        issues.push(`Product ${item.productId} is no longer available`);
        continue;
      }

      if (item.variant && item.variant.stock < item.quantity) {
        issues.push(`${item.product.name} - Only ${item.variant.stock} items available`);
      }
    }

    if (issues.length > 0) {
      throw new BadRequestException(`Cart validation failed: ${issues.join(', ')}`);
    }

    return true;
  }
}