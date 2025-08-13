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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const fuse_js_1 = require("fuse.js");
let SearchService = class SearchService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async advancedSearch(filters) {
        const { q, categoryId, minPrice, maxPrice, colors, sizes, materials, inStock, sortBy, sortOrder, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;
        const where = { isActive: true };
        if (categoryId)
            where.categoryId = categoryId;
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = minPrice;
            if (maxPrice)
                where.price.lte = maxPrice;
        }
        if (inStock)
            where.stock = { gt: 0 };
        if (colors?.length || sizes?.length || materials?.length) {
            where.variants = {
                some: {
                    AND: [
                        colors?.length ? { color: { in: colors } } : {},
                        sizes?.length ? { size: { in: sizes } } : {},
                        materials?.length ? { material: { in: materials } } : {},
                    ].filter(condition => Object.keys(condition).length > 0)
                }
            };
        }
        let orderBy = { createdAt: 'desc' };
        if (sortBy) {
            switch (sortBy) {
                case 'price':
                    orderBy = { price: sortOrder || 'asc' };
                    break;
                case 'rating':
                    orderBy = { averageRating: sortOrder || 'desc' };
                    break;
                case 'newest':
                    orderBy = { createdAt: 'desc' };
                    break;
                case 'popular':
                    orderBy = { viewCount: 'desc' };
                    break;
            }
        }
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                include: {
                    category: true,
                    variants: true,
                    reviews: { take: 5, include: { user: { select: { name: true } } } }
                },
                orderBy
            }),
            this.prisma.product.count({ where })
        ]);
        let results = products.map(product => ({
            ...product,
            images: product.images ? JSON.parse(product.images) : [],
            tags: product.tags ? JSON.parse(product.tags) : [],
            relatedProducts: product.relatedProducts ? JSON.parse(product.relatedProducts) : []
        }));
        if (q) {
            const fuse = new fuse_js_1.default(results, {
                keys: ['name', 'description', 'tags'],
                threshold: 0.3,
                includeScore: true
            });
            const searchResults = fuse.search(q);
            results = searchResults.map(result => result.item);
        }
        return {
            products: results,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            },
            filters: {
                availableColors: await this.getAvailableColors(),
                availableSizes: await this.getAvailableSizes(),
                availableMaterials: await this.getAvailableMaterials(),
                priceRange: await this.getPriceRange()
            }
        };
    }
    async getSearchSuggestions(query, limit = 5) {
        const products = await this.prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { searchKeywords: { contains: query } }
                ],
                isActive: true
            },
            select: { name: true, slug: true },
            take: limit
        });
        return products.map(p => ({ name: p.name, slug: p.slug }));
    }
    async getAvailableColors() {
        const variants = await this.prisma.productVariant.findMany({
            where: { color: { not: null }, isActive: true },
            select: { color: true },
            distinct: ['color']
        });
        return variants.map(v => v.color).filter(Boolean);
    }
    async getAvailableSizes() {
        const variants = await this.prisma.productVariant.findMany({
            where: { size: { not: null }, isActive: true },
            select: { size: true },
            distinct: ['size']
        });
        return variants.map(v => v.size).filter(Boolean);
    }
    async getAvailableMaterials() {
        const variants = await this.prisma.productVariant.findMany({
            where: { material: { not: null }, isActive: true },
            select: { material: true },
            distinct: ['material']
        });
        return variants.map(v => v.material).filter(Boolean);
    }
    async getPriceRange() {
        const result = await this.prisma.product.aggregate({
            where: { isActive: true },
            _min: { price: true },
            _max: { price: true }
        });
        return { min: result._min.price || 0, max: result._max.price || 0 };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map