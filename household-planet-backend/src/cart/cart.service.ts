import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApplyPromoDto } from './dto/apply-promo.dto';
import { SaveForLaterDto } from './dto/save-for-later.dto';
import { AbandonedCartService } from '../whatsapp/abandoned-cart.service';
import { ensureStringUserId } from '../common/utils/type-conversion.util';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private abandonedCartService: AbandonedCartService
  ) {}

  async addToCart(userId: string | number, addToCartDto: AddToCartDto) {
    const userIdStr = ensureStringUserId(userId);
    const { productId, variantId, quantity } = addToCartDto;

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check stock
    let availableStock = product.stock;
    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      if (!variant) {
        throw new NotFoundException('Product variant not found');
      }
      availableStock = variant.stock;
    }

    if (quantity > availableStock) {
      throw new BadRequestException('Insufficient stock');
    }

    // Check if item already in cart
    const existingItem = await this.prisma.cart.findUnique({
      where: {
        userId_productId_variantId: {
          userId: userIdStr,
          productId,
          variantId: variantId || null
        }
      }
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > availableStock) {
        throw new BadRequestException('Total quantity exceeds available stock');
      }

      const updatedItem = await this.prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: true,
          variant: true
        }
      });

      // Track for abandoned cart
      await this.trackAbandonedCart(userIdStr);

      return updatedItem;
    }

    const cartItem = await this.prisma.cart.create({
      data: {
        userId: userIdStr,
        productId,
        variantId,
        quantity
      },
      include: {
        product: true,
        variant: true
      }
    });

    // Track for abandoned cart
    await this.trackAbandonedCart(userIdStr);

    return cartItem;
  }

  async getCart(userId: string | number) {
    const userIdStr = ensureStringUserId(userId);
    const cartItems = await this.prisma.cart.findMany({
      where: { userId: userIdStr },
      include: {
        product: {
          include: {
            category: true
          }
        },
        variant: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = cartItems.reduce((sum, item) => {
      const price = item.variant?.price || item.product.price;
      return sum + (price * item.quantity);
    }, 0);

    return {
      items: cartItems,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  async updateCartItem(userId: string | number, itemId: string, updateCartDto: UpdateCartDto) {
    const userIdStr = ensureStringUserId(userId);
    const { quantity } = updateCartDto;

    const cartItem = await this.prisma.cart.findFirst({
      where: { id: itemId, userId: userIdStr },
      include: {
        product: { include: { variants: true } },
        variant: true
      }
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (quantity === 0) {
      return this.prisma.cart.delete({ where: { id: itemId } });
    }

    // Check stock
    let availableStock = cartItem.product.stock;
    if (cartItem.variantId) {
      availableStock = cartItem.variant.stock;
    }

    if (quantity > availableStock) {
      throw new BadRequestException('Insufficient stock');
    }

    const updatedItem = await this.prisma.cart.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: true,
        variant: true
      }
    });

    // Track for abandoned cart
    await this.trackAbandonedCart(userIdStr);

    return updatedItem;
  }

  async removeFromCart(userId: string | number, itemId: string) {
    const userIdStr = ensureStringUserId(userId);
    const cartItem = await this.prisma.cart.findFirst({
      where: { id: itemId, userId: userIdStr }
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.cart.delete({ where: { id: itemId } });
  }

  async clearCart(userId: string | number) {
    const userIdStr = ensureStringUserId(userId);
    return this.prisma.cart.deleteMany({
      where: { userId: userIdStr }
    });
  }

  async moveToWishlist(userId: string | number, itemId: string) {
    const userIdStr = ensureStringUserId(userId);
    const cartItem = await this.prisma.cart.findFirst({
      where: { id: itemId, userId: userIdStr }
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Add to wishlist if not already there
    await this.prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId: userIdStr,
          productId: cartItem.productId
        }
      },
      create: {
        userId: userIdStr,
        productId: cartItem.productId
      },
      update: {}
    });

    // Remove from cart
    await this.prisma.cart.delete({ where: { id: itemId } });

    return { message: 'Item moved to wishlist' };
  }

  async saveForLater(userId: string, saveForLaterDto: SaveForLaterDto) {
    const { cartItemId } = saveForLaterDto;
    
    const cartItem = await this.prisma.cart.findFirst({
      where: { id: cartItemId, userId },
      include: { product: true, variant: true }
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Create saved item
    const savedItem = await this.prisma.savedForLater.create({
      data: {
        userId,
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        quantity: cartItem.quantity
      },
      include: {
        product: true,
        variant: true
      }
    });

    // Remove from cart
    await this.prisma.cart.delete({ where: { id: cartItemId } });

    return savedItem;
  }

  async getSavedForLater(userId: string) {
    return this.prisma.savedForLater.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true }
        },
        variant: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async moveBackToCart(userId: string, savedItemId: string) {
    const savedItem = await this.prisma.savedForLater.findFirst({
      where: { id: savedItemId, userId }
    });

    if (!savedItem) {
      throw new NotFoundException('Saved item not found');
    }

    // Add back to cart
    const cartItem = await this.addToCart(userId, {
      productId: savedItem.productId,
      variantId: savedItem.variantId,
      quantity: savedItem.quantity
    });

    // Remove from saved items
    await this.prisma.savedForLater.delete({ where: { id: savedItemId } });

    return cartItem;
  }

  async applyPromoCode(userId: string, applyPromoDto: ApplyPromoDto) {
    const { promoCode } = applyPromoDto;
    
    // Find promo code
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: promoCode }
    });

    if (!promo) {
      throw new NotFoundException('Invalid promo code');
    }

    if (!promo.isActive || promo.expiresAt < new Date()) {
      throw new BadRequestException('Promo code has expired');
    }

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      throw new BadRequestException('Promo code usage limit reached');
    }

    // Get cart total
    const cart = await this.getCart(userId);
    
    if (promo.minimumAmount && cart.total < promo.minimumAmount) {
      throw new BadRequestException(`Minimum order amount of KES ${promo.minimumAmount} required`);
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discount = (cart.total * promo.discountValue) / 100;
      if (promo.maxDiscountAmount) {
        discount = Math.min(discount, promo.maxDiscountAmount);
      }
    } else {
      discount = promo.discountValue;
    }

    const finalTotal = Math.max(0, cart.total - discount);

    return {
      promoCode: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discount,
      originalTotal: cart.total,
      finalTotal,
      savings: discount
    };
  }

  async getCartWithPromo(userId: string, promoCode?: string) {
    const cart = await this.getCart(userId);
    
    if (!promoCode) {
      return cart;
    }

    try {
      const promoResult = await this.applyPromoCode(userId, { promoCode });
      return {
        ...cart,
        promo: promoResult,
        finalTotal: promoResult.finalTotal
      };
    } catch (error) {
      return {
        ...cart,
        promoError: error.message
      };
    }
  }

  async removeSavedItem(userId: string, savedItemId: string) {
    const savedItem = await this.prisma.savedForLater.findFirst({
      where: { id: savedItemId, userId }
    });

    if (!savedItem) {
      throw new NotFoundException('Saved item not found');
    }

    return this.prisma.savedForLater.delete({ where: { id: savedItemId } });
  }

  private async trackAbandonedCart(userId: string) {
    try {
      const cart = await this.getCart(userId);
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      
      if (cart.items.length > 0 && user?.phone) {
        await this.abandonedCartService.trackAbandonedCart(
          userId,
          undefined,
          user.phone,
          cart.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant?.price || item.product.price,
            name: item.product.name
          }))
        );
      }
    } catch (error) {
      // Silently fail - don't break cart functionality
      console.error('Failed to track abandoned cart:', error);
    }
  }
}