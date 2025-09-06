import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: number) {
    // Clean expired items first
    await this.cleanExpiredItems(userId);
    
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

    const now = new Date();
    const expiryWarnings = cartItems.filter(item => {
      const hoursLeft = (48 - (now.getTime() - item.createdAt.getTime()) / (1000 * 60 * 60));
      return hoursLeft <= 24 && hoursLeft > 0;
    });

    return {
      items: cartItems.map(item => {
        const hoursLeft = Math.max(0, 48 - (now.getTime() - item.createdAt.getTime()) / (1000 * 60 * 60));
        return {
          ...item,
          product: {
            ...item.product,
            images: JSON.parse(item.product.images),
            tags: JSON.parse(item.product.tags)
          },
          itemTotal: Number(item.variant ? item.variant.price : item.product.price) * item.quantity,
          expiresIn: Math.ceil(hoursLeft)
        };
      }),
      summary: {
        subtotal,
        totalItems,
        estimatedShipping: subtotal > 5000 ? 0 : 200,
        total: subtotal + (subtotal > 5000 ? 0 : 200)
      },
      notices: this.generateCartNotices(expiryWarnings, cartItems.length)
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

    const existing = await this.prisma.cart.findFirst({
      where: {
        userId,
        productId: dto.productId,
        variantId: dto.variantId || null
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

  private async cleanExpiredItems(userId: number) {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await this.prisma.cart.deleteMany({
      where: {
        userId,
        createdAt: { lt: twoDaysAgo }
      }
    });
  }

  private generateCartNotices(expiryWarnings: any[], totalItems: number) {
    const notices = [];
    
    if (expiryWarnings.length > 0) {
      const messages = [
        `⏰ ${expiryWarnings.length} item${expiryWarnings.length > 1 ? 's' : ''} expiring soon! Don't let them slip away.`,
        `🚨 Hurry! ${expiryWarnings.length} item${expiryWarnings.length > 1 ? 's' : ''} will vanish in 24 hours.`,
        `⚡ Quick! ${expiryWarnings.length} item${expiryWarnings.length > 1 ? 's' : ''} about to disappear from your cart.`
      ];
      notices.push({
        type: 'warning',
        message: messages[Math.floor(Math.random() * messages.length)]
      });
    }
    
    if (totalItems > 0) {
      const tips = [
        '💡 Cart items stay fresh for 48 hours - like your favorite snacks!',
        '🛒 Your cart has a 2-day shelf life. Shop before it expires!',
        '⏳ Items auto-remove after 2 days to keep your cart tidy.',
        '🧹 We clean up old cart items every 2 days - no clutter here!'
      ];
      notices.push({
        type: 'info',
        message: tips[Math.floor(Math.random() * tips.length)]
      });
    }
    
    return notices;
  }

  async syncLocalCart(userId: number, localItems: Array<{ productId: number; variantId?: number; quantity: number }>) {
    if (!localItems || localItems.length === 0) {
      return;
    }
    
    for (const item of localItems) {
      try {
        // Check if item already exists in cart
        const existing = await this.prisma.cart.findFirst({
          where: {
            userId,
            productId: item.productId,
            variantId: item.variantId || null
          }
        });

        if (existing) {
          // Update quantity instead of adding
          await this.prisma.cart.update({
            where: { id: existing.id },
            data: { quantity: item.quantity }
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
      } catch (error) {
        console.warn(`Failed to sync cart item ${item.productId}:`, error.message);
      }
    }
  }

  async moveToCart(userId: number, wishlistId: number) {
    const wishlistItem = await this.prisma.wishlist.findFirst({
      where: { id: wishlistId, userId },
      include: { product: true }
    });

    if (!wishlistItem) {
      throw new NotFoundException('Wishlist item not found');
    }

    // Add to cart
    await this.addToCart(userId, {
      productId: wishlistItem.productId,
      quantity: 1
    });

    // Remove from wishlist
    await this.prisma.wishlist.delete({ where: { id: wishlistId } });

    return { success: true, message: 'Item moved to cart successfully' };
  }
}