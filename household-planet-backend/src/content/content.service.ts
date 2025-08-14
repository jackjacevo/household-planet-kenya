import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlogService } from './blog.service';
import { SeoService } from './seo.service';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private blogService: BlogService,
    private seoService: SeoService,
  ) {}

  async createFAQ(data: {
    question: string;
    answer: string;
    category: string;
  }) {
    return this.prisma.fAQ.create({
      data,
    });
  }

  async getFAQs(category?: string) {
    return this.prisma.fAQ.findMany({
      where: category ? { category } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createPage(data: {
    title: string;
    slug: string;
    content: string;
    seoTitle?: string;
    seoDescription?: string;
  }) {
    return this.prisma.page.create({
      data,
    });
  }

  async getPageBySlug(slug: string) {
    return this.prisma.page.findUnique({
      where: { slug },
    });
  }

  async searchContent(query: string, filters?: {
    type?: 'product' | 'blog' | 'page';
    category?: string;
    limit?: number;
  }) {
    const limit = filters?.limit || 20;
    const searchResults = [];

    // Search products
    if (!filters?.type || filters.type === 'product') {
      const products = await this.prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { keywords: { contains: query } },
          ],
          isActive: true,
          categoryId: filters?.category,
        },
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          images: true,
          category: { select: { name: true } },
        },
      });

      searchResults.push(...products.map(p => ({
        ...p,
        type: 'product',
        url: `/products/${p.slug}`,
      })));
    }

    // Search blog posts
    if (!filters?.type || filters.type === 'blog') {
      const posts = await this.prisma.blogPost.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
          ],
          status: 'PUBLISHED',
        },
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          publishedAt: true,
        },
      });

      searchResults.push(...posts.map(p => ({
        ...p,
        type: 'blog',
        url: `/blog/${p.slug}`,
      })));
    }

    // Search pages
    if (!filters?.type || filters.type === 'page') {
      const pages = await this.prisma.page.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
          ],
          isActive: true,
        },
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
        },
      });

      searchResults.push(...pages.map(p => ({
        ...p,
        type: 'page',
        url: `/${p.slug}`,
      })));
    }

    // Log search query for analytics
    await this.logSearchQuery(query, searchResults.length);

    return {
      query,
      results: searchResults.slice(0, limit),
      total: searchResults.length,
    };
  }

  private async logSearchQuery(query: string, resultCount: number) {
    try {
      await this.prisma.searchLog.create({
        data: {
          query: query.toLowerCase(),
          results: resultCount,
        },
      });
    } catch (error) {
      console.error('Failed to log search query:', error);
    }
  }

  async getSearchAnalytics(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [topQueries, noResultQueries, totalSearches] = await Promise.all([
      this.prisma.searchLog.groupBy({
        by: ['query'],
        where: {
          timestamp: { gte: startDate },
          results: { gt: 0 },
        },
        _count: { query: true },
        orderBy: { _count: { query: 'desc' } },
        take: 10,
      }),
      this.prisma.searchLog.groupBy({
        by: ['query'],
        where: {
          timestamp: { gte: startDate },
          results: 0,
        },
        _count: { query: true },
        orderBy: { _count: { query: 'desc' } },
        take: 10,
      }),
      this.prisma.searchLog.count({
        where: { timestamp: { gte: startDate } },
      }),
    ]);

    return {
      totalSearches,
      topQueries: topQueries.map(q => ({
        query: q.query,
        count: q._count.query,
      })),
      noResultQueries: noResultQueries.map(q => ({
        query: q.query,
        count: q._count.query,
      })),
    };
  }

  async optimizeAllContent() {
    // Optimize all products
    const products = await this.prisma.product.findMany({
      select: { id: true },
      // where: { status: 'ACTIVE' }, // Remove if status field doesn't exist
    });

    for (const product of products) {
      await this.seoService.optimizeProductSEO(product.id);
      await this.seoService.generateProductAltText(product.id);
    }

    // Optimize all categories
    const categories = await this.prisma.category.findMany({
      select: { id: true },
    });

    for (const category of categories) {
      await this.seoService.generateCategoryContent(category.id);
    }

    return {
      optimizedProducts: products.length,
      optimizedCategories: categories.length,
    };
  }
}