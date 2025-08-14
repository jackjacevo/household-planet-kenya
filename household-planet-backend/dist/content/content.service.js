"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const blog_service_1 = require("./blog.service");
const seo_service_1 = require("./seo.service");
let ContentService = class ContentService {
    constructor(prisma, blogService, seoService) {
        this.prisma = prisma;
        this.blogService = blogService;
        this.seoService = seoService;
    }
    async createFAQ(data) {
        return this.prisma.fAQ.create({
            data,
        });
    }
    async getFAQs(category) {
        return this.prisma.fAQ.findMany({
            where: category ? { category } : undefined,
            orderBy: { sortOrder: 'asc' },
        });
    }
    async createPage(data) {
        return this.prisma.page.create({
            data,
        });
    }
    async getPageBySlug(slug) {
        return this.prisma.page.findUnique({
            where: { slug },
        });
    }
    async searchContent(query, filters) {
        const limit = filters?.limit || 20;
        const searchResults = [];
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
        await this.logSearchQuery(query, searchResults.length);
        return {
            query,
            results: searchResults.slice(0, limit),
            total: searchResults.length,
        };
    }
    async logSearchQuery(query, resultCount) {
        try {
            await this.prisma.searchLog.create({
                data: {
                    query: query.toLowerCase(),
                    results: resultCount,
                },
            });
        }
        catch (error) {
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
        const products = await this.prisma.product.findMany({
            select: { id: true },
        });
        for (const product of products) {
            await this.seoService.optimizeProductSEO(product.id);
            await this.seoService.generateProductAltText(product.id);
        }
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
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        blog_service_1.BlogService,
        seo_service_1.SeoService])
], ContentService);
//# sourceMappingURL=content.service.js.map