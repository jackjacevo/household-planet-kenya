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
exports.RecommendationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RecommendationsService = class RecommendationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRecommendations(productId, userId, limit = 6) {
        const recommendations = await this.prisma.productRecommendation.findMany({
            where: { productId },
            include: {
                recommended: {
                    include: {
                        category: true,
                        variants: true
                    }
                }
            },
            orderBy: { score: 'desc' },
            take: limit
        });
        return recommendations.map(rec => ({
            ...rec.recommended,
            images: rec.recommended.images ? JSON.parse(rec.recommended.images) : [],
            tags: rec.recommended.tags ? JSON.parse(rec.recommended.tags) : [],
            recommendationType: rec.type,
            score: rec.score
        }));
    }
    async getRelatedProducts(productId, limit = 6) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { categoryId: true, tags: true }
        });
        if (!product)
            return [];
        const relatedProducts = await this.prisma.product.findMany({
            where: {
                AND: [
                    { id: { not: productId } },
                    { isActive: true },
                    {
                        OR: [
                            { categoryId: product.categoryId },
                            product.tags ? { tags: { contains: product.tags } } : {}
                        ].filter(condition => Object.keys(condition).length > 0)
                    }
                ]
            },
            include: {
                category: true,
                variants: true
            },
            orderBy: { averageRating: 'desc' },
            take: limit
        });
        return relatedProducts.map(p => ({
            ...p,
            images: p.images ? JSON.parse(p.images) : [],
            tags: p.tags ? JSON.parse(p.tags) : []
        }));
    }
    async getRecentlyViewed(userId, limit = 10) {
        const recentlyViewed = await this.prisma.recentlyViewed.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        category: true,
                        variants: true
                    }
                }
            },
            orderBy: { viewedAt: 'desc' },
            take: limit
        });
        return recentlyViewed.map(rv => ({
            ...rv.product,
            images: rv.product.images ? JSON.parse(rv.product.images) : [],
            tags: rv.product.tags ? JSON.parse(rv.product.tags) : [],
            viewedAt: rv.viewedAt
        }));
    }
    async trackProductView(productId, userId) {
        await this.prisma.product.update({
            where: { id: productId },
            data: { viewCount: { increment: 1 } }
        });
        if (userId) {
            await this.prisma.recentlyViewed.upsert({
                where: {
                    userId_productId: { userId, productId }
                },
                update: { viewedAt: new Date() },
                create: { userId, productId }
            });
        }
    }
    async generateRecommendations() {
        const orderItems = await this.prisma.orderItem.findMany({
            include: { order: { include: { items: true } } }
        });
        const productPairs = new Map();
        orderItems.forEach(item => {
            const otherItems = item.order.items.filter(i => i.productId !== item.productId);
            if (!productPairs.has(item.productId)) {
                productPairs.set(item.productId, new Map());
            }
            otherItems.forEach(otherItem => {
                const pairMap = productPairs.get(item.productId);
                const currentCount = pairMap.get(otherItem.productId) || 0;
                pairMap.set(otherItem.productId, currentCount + 1);
            });
        });
        for (const [productId, pairs] of productPairs) {
            const sortedPairs = Array.from(pairs.entries())
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10);
            for (const [recommendedId, count] of sortedPairs) {
                await this.prisma.productRecommendation.upsert({
                    where: {
                        productId_recommendedId_type: {
                            productId,
                            recommendedId,
                            type: 'frequently_bought'
                        }
                    },
                    update: { score: count },
                    create: {
                        productId,
                        recommendedId,
                        type: 'frequently_bought',
                        score: count
                    }
                });
            }
        }
    }
};
exports.RecommendationsService = RecommendationsService;
exports.RecommendationsService = RecommendationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecommendationsService);
//# sourceMappingURL=recommendations.service.js.map