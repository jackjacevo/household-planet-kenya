import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: number) {
    // Clean expired items first
    await this.cleanExpiredItems(userId);
    
    const wishlistItems = await this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true, brand: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    const expiryWarnings = wishlistItems.filter(item => {
      const hoursLeft = (48 - (now.getTime() - item.createdAt.getTime()) / (1000 * 60 * 60));
      return hoursLeft <= 24 && hoursLeft > 0;
    });

    return {
      items: wishlistItems.map(item => {
        const hoursLeft = Math.max(0, 48 - (now.getTime() - item.createdAt.getTime()) / (1000 * 60 * 60));
        return {
          ...item,
          product: {
            ...item.product,
            images: JSON.parse(item.product.images),
            tags: JSON.parse(item.product.tags)
          },
          expiresIn: Math.ceil(hoursLeft)
        };
      }),
      notices: this.generateWishlistNotices(expiryWarnings, wishlistItems.length)
    };
  }

  async addToWishlist(userId: number, productId: number) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true }
    });

    if (!product) {
      throw new NotFoundException('Product not found or inactive');
    }

    return this.prisma.wishlist.upsert({
      where: {
        userId_productId: { userId, productId }
      },
      create: { userId, productId },
      update: {},
      include: { product: true }
    });
  }

  async removeFromWishlist(userId: number, productId: number) {
    const wishlistItem = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (!wishlistItem) {
      throw new NotFoundException('Item not found in wishlist');
    }

    return this.prisma.wishlist.delete({
      where: {
        userId_productId: { userId, productId }
      }
    });
  }

  async clearWishlist(userId: number) {
    return this.prisma.wishlist.deleteMany({ where: { userId } });
  }

  async moveToCart(userId: number, productId: number) {
    const wishlistItem = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId }
      },
      include: { product: true }
    });

    if (!wishlistItem) {
      throw new NotFoundException('Item not found in wishlist');
    }

    await this.prisma.cart.upsert({
      where: {
        userId_productId_variantId: {
          userId,
          productId,
          variantId: null
        }
      },
      create: {
        userId,
        productId,
        quantity: 1
      },
      update: {
        quantity: { increment: 1 }
      }
    });

    await this.prisma.wishlist.delete({
      where: {
        userId_productId: { userId, productId }
      }
    });

    return { success: true };
  }

  private async cleanExpiredItems(userId: number) {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await this.prisma.wishlist.deleteMany({
      where: {
        userId,
        createdAt: { lt: twoDaysAgo }
      }
    });
  }

  private generateWishlistNotices(expiryWarnings: any[], totalItems: number) {
    const notices = [];
    
    if (expiryWarnings.length > 0) {
      const messages = [
        `✨ ${expiryWarnings.length} wish${expiryWarnings.length > 1 ? 'es' : ''} fading away! Make them real soon.`,
        `💖 Your ${expiryWarnings.length} favorite${expiryWarnings.length > 1 ? 's' : ''} expire${expiryWarnings.length === 1 ? 's' : ''} in 24 hours.`,
        `🌠 ${expiryWarnings.length} shooting star${expiryWarnings.length > 1 ? 's' : ''} about to disappear!`
      ];
      notices.push({
        type: 'warning',
        message: messages[Math.floor(Math.random() * messages.length)]
      });
    }
    
    if (totalItems > 0) {
      const tips = [
        '🌈 Wishes have a 48-hour magic window before they float away.',
        '🧚‍♀️ Your wishlist fairy cleans up old dreams every 2 days.',
        '✨ Like shooting stars, wishes disappear after 2 days if not caught.',
        '💫 Fresh wishes only! We clear the old ones every 48 hours.'
      ];
      notices.push({
        type: 'info',
        message: tips[Math.floor(Math.random() * tips.length)]
      });
    }
    
    return notices;
  }
}