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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const search_service_1 = require("./services/search.service");
const recommendations_service_1 = require("./services/recommendations.service");
const inventory_service_1 = require("./services/inventory.service");
let ProductsService = class ProductsService {
    constructor(prisma, searchService, recommendationsService, inventoryService) {
        this.prisma = prisma;
        this.searchService = searchService;
        this.recommendationsService = recommendationsService;
        this.inventoryService = inventoryService;
    }
    async create(createProductDto) {
        const { images, tags, ...productData } = createProductDto;
        const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return this.prisma.product.create({
            data: {
                ...productData,
                slug,
                images: images ? JSON.stringify(images) : null,
                tags: tags ? JSON.stringify(tags) : null,
                searchKeywords: `${productData.name} ${productData.description || ''} ${tags?.join(' ') || ''}`.toLowerCase(),
                stock: productData.stock || 0,
                lowStockThreshold: productData.lowStockThreshold || 10,
                trackInventory: productData.trackInventory !== false
            },
            include: { category: true, variants: true }
        });
    }
    async findAll(page = 1, limit = 10, categoryId, featured) {
        const skip = (page - 1) * limit;
        const where = { isActive: true };
        if (categoryId)
            where.categoryId = categoryId;
        if (featured !== undefined)
            where.isFeatured = featured;
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                include: { category: true, variants: true },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.product.count({ where })
        ]);
        return {
            products: products.map(product => ({
                ...product,
                images: product.images ? JSON.parse(product.images) : [],
                tags: product.tags ? JSON.parse(product.tags) : []
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async findOne(id, userId) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                variants: { where: { isActive: true } },
                reviews: {
                    include: { user: { select: { name: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });
        if (product) {
            await this.recommendationsService.trackProductView(id, userId);
            const [recommendations, relatedProducts] = await Promise.all([
                this.recommendationsService.getRecommendations(id, userId),
                this.recommendationsService.getRelatedProducts(id)
            ]);
            return {
                ...product,
                images: product.images ? JSON.parse(product.images) : [],
                tags: product.tags ? JSON.parse(product.tags) : [],
                recommendations,
                relatedProducts,
                reviews: product.reviews.map(review => ({
                    ...review,
                    images: review.images ? JSON.parse(review.images) : []
                }))
            };
        }
        return product;
    }
    async update(id, updateProductDto) {
        const { images, tags, ...productData } = updateProductDto;
        const updateData = { ...productData };
        if (images)
            updateData.images = JSON.stringify(images);
        if (tags) {
            updateData.tags = JSON.stringify(tags);
            updateData.searchKeywords = `${productData.name || ''} ${productData.description || ''} ${tags.join(' ')}`.toLowerCase();
        }
        const product = await this.prisma.product.update({
            where: { id },
            data: updateData,
            include: { category: true, variants: true }
        });
        if (productData.stock !== undefined) {
            await this.inventoryService.checkLowStock(id, null);
        }
        return product;
    }
    async remove(id) {
        return this.prisma.product.delete({ where: { id } });
    }
    async createVariant(productId, createVariantDto) {
        const variant = await this.prisma.productVariant.create({
            data: {
                ...createVariantDto,
                productId,
                lowStockThreshold: createVariantDto.lowStockThreshold || 5,
                attributes: createVariantDto.attributes ? JSON.stringify(createVariantDto.attributes) : null
            }
        });
        await this.inventoryService.checkLowStock(null, variant.id);
        return variant;
    }
    async updateVariant(variantId, updateData) {
        return this.prisma.productVariant.update({
            where: { id: variantId },
            data: {
                ...updateData,
                attributes: updateData.attributes ? JSON.stringify(updateData.attributes) : undefined
            }
        });
    }
    async removeVariant(variantId) {
        return this.prisma.productVariant.delete({ where: { id: variantId } });
    }
    async bulkUpdatePrices(updates) {
        const results = await Promise.all(updates.map(update => this.prisma.product.update({
            where: { id: update.id },
            data: { price: update.price }
        })));
        return { updated: results.length };
    }
    async search(query, page = 1, limit = 10) {
        return this.searchService.advancedSearch({ q: query, page, limit });
    }
    async advancedSearch(filters) {
        return this.searchService.advancedSearch(filters);
    }
    async getSearchSuggestions(query) {
        return this.searchService.getSearchSuggestions(query);
    }
    async createReview(productId, userId, createReviewDto) {
        const review = await this.prisma.review.create({
            data: {
                ...createReviewDto,
                productId,
                userId,
                images: createReviewDto.images ? JSON.stringify(createReviewDto.images) : null
            },
            include: { user: { select: { name: true } } }
        });
        await this.updateProductRating(productId);
        return {
            ...review,
            images: review.images ? JSON.parse(review.images) : []
        };
    }
    async getRecentlyViewed(userId) {
        return this.recommendationsService.getRecentlyViewed(userId);
    }
    async updateStock(productId, variantId, quantity, operation) {
        return this.inventoryService.updateStock(productId, variantId, quantity, operation);
    }
    async getLowStockProducts() {
        return this.inventoryService.getLowStockProducts();
    }
    async getInventoryAlerts() {
        return this.inventoryService.getInventoryAlerts(false);
    }
    async findBySlug(slug, userId) {
        const product = await this.prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                variants: { where: { isActive: true } },
                reviews: {
                    include: { user: { select: { name: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });
        if (product && userId) {
            await this.trackView(product.id, userId);
        }
        if (product) {
            return {
                ...product,
                images: product.images ? JSON.parse(product.images) : [],
                tags: product.tags ? JSON.parse(product.tags) : [],
                reviews: product.reviews.map(review => ({
                    ...review,
                    images: review.images ? JSON.parse(review.images) : []
                }))
            };
        }
        return product;
    }
    async getRelatedProducts(productId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { categoryId: true }
        });
        if (!product)
            return [];
        const relatedProducts = await this.prisma.product.findMany({
            where: {
                categoryId: product.categoryId,
                id: { not: productId },
                isActive: true
            },
            take: 8,
            include: { category: true },
            orderBy: { viewCount: 'desc' }
        });
        return relatedProducts.map(product => ({
            ...product,
            images: product.images ? JSON.parse(product.images) : []
        }));
    }
    async trackView(productId, userId) {
        await this.prisma.product.update({
            where: { id: productId },
            data: { viewCount: { increment: 1 } }
        });
        await this.prisma.recentlyViewed.upsert({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            },
            update: {
                viewedAt: new Date()
            },
            create: {
                userId,
                productId,
                viewedAt: new Date()
            }
        });
        return { success: true };
    }
    async removeFromRecentlyViewed(userId, productId) {
        await this.prisma.recentlyViewed.delete({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            }
        });
        return { success: true };
    }
    async updateProductRating(productId) {
        const reviews = await this.prisma.review.findMany({
            where: { productId },
            select: { rating: true }
        });
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;
        await this.prisma.product.update({
            where: { id: productId },
            data: {
                averageRating: Math.round(averageRating * 10) / 10,
                totalReviews: reviews.length
            }
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        search_service_1.SearchService,
        recommendations_service_1.RecommendationsService,
        inventory_service_1.InventoryService])
], ProductsService);
//# sourceMappingURL=products.service.js.map