import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CleanupService {
  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredItems() {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    
    const [cartDeleted, wishlistDeleted] = await Promise.all([
      this.prisma.cart.deleteMany({
        where: { createdAt: { lt: twoDaysAgo } }
      }),
      this.prisma.wishlist.deleteMany({
        where: { createdAt: { lt: twoDaysAgo } }
      })
    ]);

    if (cartDeleted.count > 0 || wishlistDeleted.count > 0) {
      console.log(`🧹 Cleaned up ${cartDeleted.count} cart items and ${wishlistDeleted.count} wishlist items`);
    }
  }
}