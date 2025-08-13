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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
let InventoryService = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateStock(productId, variantId, quantity, operation) {
        const updateData = {
            stock: operation === 'add' ? { increment: quantity } : { decrement: quantity }
        };
        if (variantId) {
            const variant = await this.prisma.productVariant.update({
                where: { id: variantId },
                data: updateData
            });
            await this.checkLowStock(null, variantId);
            return variant;
        }
        else {
            const product = await this.prisma.product.update({
                where: { id: productId },
                data: updateData
            });
            await this.checkLowStock(productId, null);
            return product;
        }
    }
    async checkLowStock(productId, variantId) {
        if (variantId) {
            const variant = await this.prisma.productVariant.findUnique({
                where: { id: variantId },
                include: { product: true }
            });
            if (variant && variant.stock <= variant.lowStockThreshold) {
                await this.createInventoryAlert(null, variantId, variant.stock === 0 ? 'out_of_stock' : 'low_stock', `${variant.product.name} - ${variant.name} is ${variant.stock === 0 ? 'out of stock' : 'running low'} (${variant.stock} remaining)`);
            }
        }
        if (productId) {
            const product = await this.prisma.product.findUnique({
                where: { id: productId }
            });
            if (product && product.trackInventory && product.stock <= product.lowStockThreshold) {
                await this.createInventoryAlert(productId, null, product.stock === 0 ? 'out_of_stock' : 'low_stock', `${product.name} is ${product.stock === 0 ? 'out of stock' : 'running low'} (${product.stock} remaining)`);
            }
        }
    }
    async createInventoryAlert(productId, variantId, type, message) {
        await this.prisma.inventoryAlert.create({
            data: {
                productId,
                variantId,
                type,
                message
            }
        });
    }
    async getInventoryAlerts(isRead) {
        return this.prisma.inventoryAlert.findMany({
            where: isRead !== undefined ? { isRead } : {},
            orderBy: { createdAt: 'desc' }
        });
    }
    async markAlertAsRead(alertId) {
        return this.prisma.inventoryAlert.update({
            where: { id: alertId },
            data: { isRead: true }
        });
    }
    async getLowStockProducts() {
        const allProducts = await this.prisma.product.findMany({
            where: { trackInventory: true },
            include: { category: true }
        });
        const allVariants = await this.prisma.productVariant.findMany({
            include: { product: { include: { category: true } } }
        });
        const lowStockProducts = allProducts.filter(p => p.stock <= p.lowStockThreshold);
        const lowStockVariants = allVariants.filter(v => v.stock <= v.lowStockThreshold);
        return {
            products: lowStockProducts.map(p => ({
                ...p,
                images: p.images ? JSON.parse(p.images) : []
            })),
            variants: lowStockVariants.map(v => ({
                ...v,
                product: {
                    ...v.product,
                    images: v.product.images ? JSON.parse(v.product.images) : []
                }
            }))
        };
    }
    async checkAllInventoryLevels() {
        const allProducts = await this.prisma.product.findMany({
            where: { trackInventory: true },
            select: { id: true, stock: true, lowStockThreshold: true }
        });
        const allVariants = await this.prisma.productVariant.findMany({
            select: { id: true, stock: true, lowStockThreshold: true }
        });
        const lowStockProducts = allProducts.filter(p => p.stock <= p.lowStockThreshold);
        const lowStockVariants = allVariants.filter(v => v.stock <= v.lowStockThreshold);
        for (const product of lowStockProducts) {
            await this.checkLowStock(product.id, null);
        }
        for (const variant of lowStockVariants) {
            await this.checkLowStock(null, variant.id);
        }
    }
};
exports.InventoryService = InventoryService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryService.prototype, "checkAllInventoryLevels", null);
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map