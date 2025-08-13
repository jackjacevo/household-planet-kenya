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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const abandoned_cart_service_1 = require("../whatsapp/abandoned-cart.service");
let CartService = class CartService {
    constructor(prisma, abandonedCartService) {
        this.prisma = prisma;
        this.abandonedCartService = abandonedCartService;
    }
    async addToCart(userId, addToCartDto) {
        const { productId, variantId, quantity } = addToCartDto;
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: { variants: true }
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        let availableStock = product.stock;
        if (variantId) {
            const variant = product.variants.find(v => v.id === variantId);
            if (!variant) {
                throw new common_1.NotFoundException('Product variant not found');
            }
            availableStock = variant.stock;
        }
        if (quantity > availableStock) {
            throw new common_1.BadRequestException('Insufficient stock');
        }
        const existingItem = await this.prisma.cart.findUnique({
            where: {
                userId_productId_variantId: {
                    userId,
                    productId,
                    variantId: variantId || null
                }
            }
        });
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > availableStock) {
                throw new common_1.BadRequestException('Total quantity exceeds available stock');
            }
            const updatedItem = await this.prisma.cart.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
                include: {
                    product: true,
                    variant: true
                }
            });
            await this.trackAbandonedCart(userId);
            return updatedItem;
        }
        const cartItem = await this.prisma.cart.create({
            data: {
                userId,
                productId,
                variantId,
                quantity
            },
            include: {
                product: true,
                variant: true
            }
        });
        await this.trackAbandonedCart(userId);
        return cartItem;
    }
    async getCart(userId) {
        const cartItems = await this.prisma.cart.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        category: true
                    }
                },
                variant: true
            },
            orderBy: { createdAt: 'desc' }
        });
        const total = cartItems.reduce((sum, item) => {
            const price = item.variant?.price || item.product.price;
            return sum + (price * item.quantity);
        }, 0);
        return {
            items: cartItems,
            total,
            itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
        };
    }
    async updateCartItem(userId, itemId, updateCartDto) {
        const { quantity } = updateCartDto;
        const cartItem = await this.prisma.cart.findFirst({
            where: { id: itemId, userId },
            include: {
                product: { include: { variants: true } },
                variant: true
            }
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        if (quantity === 0) {
            return this.prisma.cart.delete({ where: { id: itemId } });
        }
        let availableStock = cartItem.product.stock;
        if (cartItem.variantId) {
            availableStock = cartItem.variant.stock;
        }
        if (quantity > availableStock) {
            throw new common_1.BadRequestException('Insufficient stock');
        }
        const updatedItem = await this.prisma.cart.update({
            where: { id: itemId },
            data: { quantity },
            include: {
                product: true,
                variant: true
            }
        });
        await this.trackAbandonedCart(userId);
        return updatedItem;
    }
    async removeFromCart(userId, itemId) {
        const cartItem = await this.prisma.cart.findFirst({
            where: { id: itemId, userId }
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        return this.prisma.cart.delete({ where: { id: itemId } });
    }
    async clearCart(userId) {
        return this.prisma.cart.deleteMany({
            where: { userId }
        });
    }
    async moveToWishlist(userId, itemId) {
        const cartItem = await this.prisma.cart.findFirst({
            where: { id: itemId, userId }
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        await this.prisma.wishlist.upsert({
            where: {
                userId_productId: {
                    userId,
                    productId: cartItem.productId
                }
            },
            create: {
                userId,
                productId: cartItem.productId
            },
            update: {}
        });
        await this.prisma.cart.delete({ where: { id: itemId } });
        return { message: 'Item moved to wishlist' };
    }
    async saveForLater(userId, saveForLaterDto) {
        const { cartItemId } = saveForLaterDto;
        const cartItem = await this.prisma.cart.findFirst({
            where: { id: cartItemId, userId },
            include: { product: true, variant: true }
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        const savedItem = await this.prisma.savedForLater.create({
            data: {
                userId,
                productId: cartItem.productId,
                variantId: cartItem.variantId,
                quantity: cartItem.quantity
            },
            include: {
                product: true,
                variant: true
            }
        });
        await this.prisma.cart.delete({ where: { id: cartItemId } });
        return savedItem;
    }
    async getSavedForLater(userId) {
        return this.prisma.savedForLater.findMany({
            where: { userId },
            include: {
                product: {
                    include: { category: true }
                },
                variant: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async moveBackToCart(userId, savedItemId) {
        const savedItem = await this.prisma.savedForLater.findFirst({
            where: { id: savedItemId, userId }
        });
        if (!savedItem) {
            throw new common_1.NotFoundException('Saved item not found');
        }
        const cartItem = await this.addToCart(userId, {
            productId: savedItem.productId,
            variantId: savedItem.variantId,
            quantity: savedItem.quantity
        });
        await this.prisma.savedForLater.delete({ where: { id: savedItemId } });
        return cartItem;
    }
    async applyPromoCode(userId, applyPromoDto) {
        const { promoCode } = applyPromoDto;
        const promo = await this.prisma.promoCode.findUnique({
            where: { code: promoCode }
        });
        if (!promo) {
            throw new common_1.NotFoundException('Invalid promo code');
        }
        if (!promo.isActive || promo.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Promo code has expired');
        }
        if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
            throw new common_1.BadRequestException('Promo code usage limit reached');
        }
        const cart = await this.getCart(userId);
        if (promo.minimumAmount && cart.total < promo.minimumAmount) {
            throw new common_1.BadRequestException(`Minimum order amount of KES ${promo.minimumAmount} required`);
        }
        let discount = 0;
        if (promo.discountType === 'PERCENTAGE') {
            discount = (cart.total * promo.discountValue) / 100;
            if (promo.maxDiscountAmount) {
                discount = Math.min(discount, promo.maxDiscountAmount);
            }
        }
        else {
            discount = promo.discountValue;
        }
        const finalTotal = Math.max(0, cart.total - discount);
        return {
            promoCode: promo.code,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            discount,
            originalTotal: cart.total,
            finalTotal,
            savings: discount
        };
    }
    async getCartWithPromo(userId, promoCode) {
        const cart = await this.getCart(userId);
        if (!promoCode) {
            return cart;
        }
        try {
            const promoResult = await this.applyPromoCode(userId, { promoCode });
            return {
                ...cart,
                promo: promoResult,
                finalTotal: promoResult.finalTotal
            };
        }
        catch (error) {
            return {
                ...cart,
                promoError: error.message
            };
        }
    }
    async removeSavedItem(userId, savedItemId) {
        const savedItem = await this.prisma.savedForLater.findFirst({
            where: { id: savedItemId, userId }
        });
        if (!savedItem) {
            throw new common_1.NotFoundException('Saved item not found');
        }
        return this.prisma.savedForLater.delete({ where: { id: savedItemId } });
    }
    async trackAbandonedCart(userId) {
        try {
            const cart = await this.getCart(userId);
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (cart.items.length > 0 && user?.phone) {
                await this.abandonedCartService.trackAbandonedCart(userId, undefined, user.phone, cart.items.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.variant?.price || item.product.price,
                    name: item.product.name
                })));
            }
        }
        catch (error) {
            console.error('Failed to track abandoned cart:', error);
        }
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        abandoned_cart_service_1.AbandonedCartService])
], CartService);
//# sourceMappingURL=cart.service.js.map