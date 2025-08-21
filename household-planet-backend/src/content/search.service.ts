import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  // Enhanced search with analytics
  async searchProducts(query: string, filters: any = {}, userId?: number) {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    
    // Track search query
    await this.trackSearch(query, userId);

    const where: any = {
      isActive: true,
      OR: searchTerms.flatMap(term => [
        { name: { contains: term } },
        { description: { contains: term } },
        { tags: { contains: term } },
        { category: { name: { contains: term } } },
        { brand: { name: { contains: term } } }
      ])
    };

    // Apply filters
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.brandId) where.brandId = filters.brandId;
    if (filters.minPrice) where.price = { ...where.price, gte: filters.minPrice };
    if (filters.maxPrice) where.price = { ...where.price, lte: filters.maxPrice };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          reviews: true
        },
        take: filters.limit || 20,
        skip: filters.offset || 0,
        orderBy: this.getSearchOrderBy(filters.sortBy)
      }),
      this.prisma.product.count({ where })
    ]);

    // Update search result count
    await this.updateSearchResultCount(query, total);

    return {
      products: products.map(product => ({
        ...product,
        images: JSON.parse(product.images),
        tags: JSON.parse(product.tags),
        averageRating: product.reviews.length > 0 
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length 
          : 0,
        relevanceScore: this.calculateRelevanceScore(product, searchTerms)
      })),
      total,
      suggestions: await this.getSearchSuggestions(query)
    };
  }

  // Search autocomplete
  async getSearchSuggestions(query: string, limit = 10) {
    const searchTerm = query.toLowerCase();
    
    const [productSuggestions, categorySuggestions, brandSuggestions] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          isActive: true,
          name: { contains: searchTerm }
        },
        select: { name: true, slug: true },
        take: 5
      }),
      this.prisma.category.findMany({
        where: {
          name: { contains: searchTerm }
        },
        select: { name: true, slug: true },
        take: 3
      }),
      this.prisma.brand.findMany({
        where: {
          name: { contains: searchTerm }
        },
        select: { name: true, slug: true },
        take: 2
      })
    ]);

    return {
      products: productSuggestions.map(p => ({ ...p, type: 'product' })),
      categories: categorySuggestions.map(c => ({ ...c, type: 'category' })),
      brands: brandSuggestions.map(b => ({ ...b, type: 'brand' }))
    };
  }

  // Popular searches
  async getPopularSearches(limit = 10) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.searchQuery.groupBy({
      by: ['query'],
      where: {
        timestamp: { gte: thirtyDaysAgo },
        resultCount: { gt: 0 }
      },
      _count: { query: true },
      orderBy: { _count: { query: 'desc' } },
      take: limit
    });
  }

  // Search analytics
  async getSearchAnalytics(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalSearches, uniqueQueries, topQueries, noResultQueries, avgResults] = await Promise.all([
      this.prisma.searchQuery.count({
        where: { timestamp: { gte: since } }
      }),
      this.prisma.searchQuery.findMany({
        where: { timestamp: { gte: since } },
        select: { query: true },
        distinct: ['query']
      }),
      this.prisma.searchQuery.groupBy({
        by: ['query'],
        where: { timestamp: { gte: since } },
        _count: { query: true },
        orderBy: { _count: { query: 'desc' } },
        take: 20
      }),
      this.prisma.searchQuery.findMany({
        where: { 
          timestamp: { gte: since },
          resultCount: 0
        },
        select: { query: true },
        distinct: ['query'],
        take: 10
      }),
      this.prisma.searchQuery.aggregate({
        where: { timestamp: { gte: since } },
        _avg: { resultCount: true }
      })
    ]);

    return {
      totalSearches,
      uniqueQueries: uniqueQueries.length,
      topQueries,
      noResultQueries,
      averageResults: avgResults._avg.resultCount || 0,
      searchTrends: await this.getSearchTrends(days)
    };
  }

  // Search trends over time
  async getSearchTrends(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as searches,
        COUNT(DISTINCT query) as unique_queries,
        AVG(resultCount) as avg_results
      FROM search_queries 
      WHERE timestamp >= ${since}
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `;
  }

  // Track search query
  private async trackSearch(query: string, userId?: number) {
    return this.prisma.searchQuery.create({
      data: {
        query: query.toLowerCase().trim(),
        userId,
        timestamp: new Date(),
        resultCount: 0 // Will be updated after search
      }
    });
  }

  // Update search result count
  private async updateSearchResultCount(query: string, count: number) {
    const recentSearch = await this.prisma.searchQuery.findFirst({
      where: { 
        query: query.toLowerCase().trim(),
        timestamp: { gte: new Date(Date.now() - 5000) } // Within last 5 seconds
      },
      orderBy: { timestamp: 'desc' }
    });

    if (recentSearch) {
      await this.prisma.searchQuery.update({
        where: { id: recentSearch.id },
        data: { resultCount: count }
      });
    }
  }

  // Calculate relevance score
  private calculateRelevanceScore(product: any, searchTerms: string[]): number {
    let score = 0;
    const productText = `${product.name} ${product.description} ${product.tags}`.toLowerCase();
    
    searchTerms.forEach(term => {
      // Exact match in name gets highest score
      if (product.name.toLowerCase().includes(term)) score += 10;
      
      // Match in description
      if (product.description?.toLowerCase().includes(term)) score += 5;
      
      // Match in tags
      if (product.tags.toLowerCase().includes(term)) score += 3;
      
      // Match in category
      if (product.category?.name.toLowerCase().includes(term)) score += 2;
      
      // Match in brand
      if (product.brand?.name.toLowerCase().includes(term)) score += 2;
    });

    return score;
  }

  // Get search order by
  private getSearchOrderBy(sortBy?: string) {
    if (sortBy === 'price_asc') return { price: 'asc' as const };
    if (sortBy === 'price_desc') return { price: 'desc' as const };
    if (sortBy === 'rating') return { reviews: { _count: 'desc' as const } };
    if (sortBy === 'newest') return { createdAt: 'desc' as const };
    
    // Default: relevance-based ordering
    return { name: 'asc' as const };
  }

  // Search filters
  async getSearchFilters() {
    const [categories, brands, priceRange] = await Promise.all([
      this.prisma.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' }
      }),
      this.prisma.brand.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' }
      }),
      this.prisma.product.aggregate({
        where: { isActive: true },
        _min: { price: true },
        _max: { price: true }
      })
    ]);

    return {
      categories,
      brands,
      priceRange: {
        min: priceRange._min.price || 0,
        max: priceRange._max.price || 100000
      }
    };
  }

  // Related searches
  async getRelatedSearches(query: string, limit = 5) {
    const searchTerms = query.toLowerCase().split(' ');
    
    return this.prisma.searchQuery.findMany({
      where: {
        query: { not: query.toLowerCase() },
        OR: searchTerms.map(term => ({
          query: { contains: term }
        }))
      },
      select: { query: true },
      distinct: ['query'],
      take: limit
    });
  }
}