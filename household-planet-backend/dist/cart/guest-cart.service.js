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
exports.GuestCartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GuestCartService = class GuestCartService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateGuestCart(items) {
        const validatedItems = [];
        let total = 0;
        for (const item of items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
                include: { variants: true }
            });
            if (!product) {
                throw new common_1.BadRequestException(`Product ${item.productId} not found`);
            }
            let price = product.price;
            let availableStock = product.stock;
            if (item.variantId) {
                const variant = product.variants.find(v => v.id === item.variantId);
                if (!variant) {
                    throw new common_1.BadRequestException(`Variant ${item.variantId} not found`);
                }
                price = variant.price;
                availableStock = variant.stock;
            }
            if (item.quantity > availableStock) {
                throw new common_1.BadRequestException(`Insufficient stock for ${product.name}`);
            }
            const itemTotal = price * item.quantity;
            total += itemTotal;
            validatedItems.push({
                ...item,
                product,
                variant: item.variantId ? product.variants.find(v => v.id === item.variantId) : null,
                price,
                total: itemTotal
            });
        }
        return {
            items: validatedItems,
            total,
            itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
        };
    }
    async mergeGuestCartWithUserCart(userId, guestCartItems) {
        if (!guestCartItems || guestCartItems.length === 0) {
            return;
        }
        for (const item of guestCartItems) {
            const existingItem = await this.prisma.cart.findUnique({
                where: {
                    userId_productId_variantId: {
                        userId,
                        productId: item.productId,
                        variantId: item.variantId || null
                    }
                }
            });
            if (existingItem) {
                await this.prisma.cart.update({
                    where: { id: existingItem.id },
                    data: { quantity: existingItem.quantity + item.quantity }
                });
            }
            else {
                await this.prisma.cart.create({
                    data: {
                        userId,
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity
                    }
                });
            }
        }
    }
};
exports.GuestCartService = GuestCartService;
exports.GuestCartService = GuestCartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GuestCartService);
//# sourceMappingURL=guest-cart.service.js.map