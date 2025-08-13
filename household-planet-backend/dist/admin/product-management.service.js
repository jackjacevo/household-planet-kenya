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
exports.ProductManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const csv = require("csv-parser");
const fs = require("fs");
let ProductManagementService = class ProductManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProduct(data) {
        return this.prisma.product.create({
            data: {
                ...data,
                slug: this.generateSlug(data.name),
                sku: data.sku || this.generateSKU()
            },
            include: { category: true, variants: true }
        });
    }
    async updateProduct(id, data) {
        return this.prisma.product.update({
            where: { id },
            data: {
                ...data,
                slug: data.name ? this.generateSlug(data.name) : undefined
            },
            include: { category: true, variants: true }
        });
    }
    async deleteProduct(id) {
        return this.prisma.product.delete({ where: { id } });
    }
    async bulkUpdateProducts(updates) {
        const results = [];
        for (const update of updates) {
            const result = await this.prisma.product.update({
                where: { id: update.id },
                data: update.data
            });
            results.push(result);
        }
        return results;
    }
    async bulkDeleteProducts(ids) {
        return this.prisma.product.deleteMany({
            where: { id: { in: ids } }
        });
    }
    async importProductsFromCSV(filePath) {
        const products = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => {
                products.push({
                    name: row.name,
                    description: row.description,
                    price: parseFloat(row.price),
                    stock: parseInt(row.stock),
                    categoryId: row.categoryId,
                    sku: row.sku || this.generateSKU()
                });
            })
                .on('end', async () => {
                try {
                    const results = [];
                    for (const product of products) {
                        const created = await this.prisma.product.create({
                            data: {
                                ...product,
                                slug: this.generateSlug(product.name)
                            }
                        });
                        results.push(created);
                    }
                    resolve(results);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    async exportProductsToCSV() {
        const products = await this.prisma.product.findMany({
            include: { category: true }
        });
        const csvData = products.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            stock: p.stock,
            category: p.category.name,
            sku: p.sku,
            isActive: p.isActive
        }));
        return csvData;
    }
    async createVariant(productId, data) {
        return this.prisma.productVariant.create({
            data: {
                ...data,
                productId,
                sku: data.sku || this.generateSKU()
            }
        });
    }
    async updateVariant(id, data) {
        return this.prisma.productVariant.update({
            where: { id },
            data
        });
    }
    async deleteVariant(id) {
        return this.prisma.productVariant.delete({ where: { id } });
    }
    async createCategory(data) {
        return this.prisma.category.create({
            data: {
                ...data,
                slug: this.generateSlug(data.name)
            }
        });
    }
    async updateCategory(id, data) {
        return this.prisma.category.update({
            where: { id },
            data: {
                ...data,
                slug: data.name ? this.generateSlug(data.name) : undefined
            }
        });
    }
    async reorderCategories(orders) {
        const results = [];
        for (const order of orders) {
            const result = await this.prisma.category.update({
                where: { id: order.id },
                data: { sortOrder: order.sortOrder }
            });
            results.push(result);
        }
        return results;
    }
    async getProductAnalytics(productId) {
        const [product, orderItems, reviews] = await Promise.all([
            this.prisma.product.findUnique({
                where: { id: productId },
                include: { category: true }
            }),
            this.prisma.orderItem.findMany({
                where: { productId },
                include: { order: true }
            }),
            this.prisma.review.findMany({
                where: { productId }
            })
        ]);
        const totalSales = orderItems.reduce((sum, item) => sum + item.total, 0);
        const totalQuantitySold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;
        return {
            product,
            analytics: {
                totalSales,
                totalQuantitySold,
                viewCount: product.viewCount,
                averageRating,
                totalReviews: reviews.length,
                conversionRate: product.viewCount > 0 ? (totalQuantitySold / product.viewCount * 100) : 0
            }
        };
    }
    generateSlug(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    generateSKU() {
        return 'HP' + Date.now().toString(36).toUpperCase();
    }
};
exports.ProductManagementService = ProductManagementService;
exports.ProductManagementService = ProductManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductManagementService);
//# sourceMappingURL=product-management.service.js.map