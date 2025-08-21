import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UrlOptimizerService {
  constructor(private prisma: PrismaService) {}

  generateSeoSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async optimizeProductUrls() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: { category: true }
    });

    const updates = [];
    for (const product of products) {
      const optimizedSlug = this.generateSeoSlug(
        `${product.name} ${product.category?.name || ''} kenya`
      );
      
      if (product.slug !== optimizedSlug) {
        await this.prisma.product.update({
          where: { id: product.id },
          data: { slug: optimizedSlug }
        });
        updates.push({ id: product.id, oldSlug: product.slug, newSlug: optimizedSlug });
      }
    }

    return { optimized: updates.length, updates };
  }

  async optimizeCategoryUrls() {
    const categories = await this.prisma.category.findMany();

    const updates = [];
    for (const category of categories) {
      const optimizedSlug = this.generateSeoSlug(
        `${category.name} household products kenya`
      );
      
      if (category.slug !== optimizedSlug) {
        await this.prisma.category.update({
          where: { id: category.id },
          data: { slug: optimizedSlug }
        });
        updates.push({ id: category.id, oldSlug: category.slug, newSlug: optimizedSlug });
      }
    }

    return { optimized: updates.length, updates };
  }
}