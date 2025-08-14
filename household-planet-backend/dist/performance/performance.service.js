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
exports.PerformanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PerformanceService = class PerformanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOptimizedProducts(page = 1, limit = 20, category) {
        const skip = (page - 1) * limit;
        return this.prisma.product.findMany({
            where: {
                isActive: true,
                ...(category && { category: { slug: category } }),
            },
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                comparePrice: true,
                images: true,
                averageRating: true,
                totalReviews: true,
                stock: true,
                category: {
                    select: { name: true, slug: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
    }
    async getCachedProduct(slug) {
        return this.prisma.product.findUnique({
            where: { slug, isActive: true },
            include: {
                category: true,
                variants: true,
                reviews: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: { user: { select: { name: true } } },
                },
                _count: { select: { reviews: true } },
            },
        });
    }
    async trackPageLoad(url, loadTime, userId) {
        return this.prisma.performanceMetric.create({
            data: {
                url,
                loadTime,
                userId,
                timestamp: new Date(),
            },
        });
    }
    async getPerformanceStats() {
        const [avgLoadTime, slowestPages] = await Promise.all([
            this.prisma.performanceMetric.aggregate({
                _avg: { loadTime: true },
                where: {
                    timestamp: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
            }),
            this.prisma.performanceMetric.groupBy({
                by: ['url'],
                _avg: { loadTime: true },
                _count: { url: true },
                orderBy: { _avg: { loadTime: 'desc' } },
                take: 10,
            }),
        ]);
        return {
            averageLoadTime: avgLoadTime._avg.loadTime || 0,
            slowestPages,
        };
    }
    getOptimizedImageUrl(originalUrl, width, quality = 85) {
        if (!originalUrl)
            return '';
        const params = new URLSearchParams();
        if (width)
            params.set('w', width.toString());
        params.set('q', quality.toString());
        return `${originalUrl}?${params.toString()}`;
    }
};
exports.PerformanceService = PerformanceService;
exports.PerformanceService = PerformanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PerformanceService);
//# sourceMappingURL=performance.service.js.map