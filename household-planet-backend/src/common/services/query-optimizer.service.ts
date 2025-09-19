import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QueryOptimizerService {
  constructor(private prisma: PrismaService) {}

  async getProductsOptimized(params: {
    skip?: number;
    take?: number;
    where?: any;
    orderBy?: any;
    includeReviews?: boolean;
    includeVariants?: boolean;
  }) {
    const { skip = 0, take = 20, where, orderBy, includeReviews = false, includeVariants = false } = params;

    return this.prisma.product.findMany({
      skip,
      take,
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        comparePrice: true,
        images: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        ...(includeReviews && {
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        }),
        ...(includeVariants && {
          variants: {
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
            },
          },
        }),
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });
  }

  private categoryTreeCache: any = null;
  private categoryTreeCacheTime = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000;

  async getCategoryTree() {
    const now = Date.now();
    if (this.categoryTreeCache && (now - this.categoryTreeCacheTime) < this.CACHE_TTL) {
      return this.categoryTreeCache;
    }

    const categories = await this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    this.categoryTreeCache = this.buildCategoryTree(categories);
    this.categoryTreeCacheTime = now;
    return this.categoryTreeCache;
  }

  private buildCategoryTree(categories: any[], parentId: string | null = null): any[] {
    return categories
      .filter(cat => cat.parentId === parentId)
      .map(cat => ({
        ...cat,
        children: this.buildCategoryTree(categories, cat.id),
      }));
  }

  async searchProducts(query: string, limit = 20) {
    return this.prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
            },
          },
          {
            description: {
              contains: query,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      take: limit,
      orderBy: [
        { name: 'asc' },
      ],
    });
  }

  async getProductsByIds(ids: number[]) {
    return this.prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        comparePrice: true,
        images: true,
      },
    });
  }
}
