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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mpesa_service_1 = require("../payments/mpesa.service");
const delivery_service_1 = require("../delivery/delivery.service");
const tracking_service_1 = require("../delivery/tracking.service");
const whatsapp_service_1 = require("../whatsapp/whatsapp.service");
const abandoned_cart_service_1 = require("../whatsapp/abandoned-cart.service");
const type_conversion_util_1 = require("../common/utils/type-conversion.util");
let OrdersService = class OrdersService {
    constructor(prisma, mpesaService, deliveryService, trackingService, whatsappService, abandonedCartService) {
        this.prisma = prisma;
        this.mpesaService = mpesaService;
        this.deliveryService = deliveryService;
        this.trackingService = trackingService;
        this.whatsappService = whatsappService;
        this.abandonedCartService = abandonedCartService;
    }
    async createOrder(userId, createOrderDto) {
        const userIdStr = (0, type_conversion_util_1.ensureStringUserId)(userId);
        const { items, shippingAddress, deliveryLocation, paymentMethod } = createOrderDto;
        const deliveryPrice = await this.deliveryService.calculateDeliveryPrice(deliveryLocation);
        let subtotal = 0;
        const orderItems = [];
        for (const item of items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
                include: { variants: true }
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product ${item.productId} not found`);
            }
            let price = product.price;
            let availableStock = product.stock;
            if (item.variantId) {
                const variant = product.variants.find(v => v.id === item.variantId);
                if (!variant) {
                    throw new common_1.NotFoundException(`Variant ${item.variantId} not found`);
                }
                price = variant.price;
                availableStock = variant.stock;
            }
            if (item.quantity > availableStock) {
                throw new common_1.BadRequestException(`Insufficient stock for ${product.name}`);
            }
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;
            orderItems.push({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                price,
                total: itemTotal
            });
        }
        const total = subtotal + deliveryPrice;
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const order = await this.prisma.order.create({
            data: {
                userId: userIdStr,
                orderNumber,
                subtotal,
                shippingCost: deliveryPrice,
                total,
                shippingAddress,
                deliveryLocation,
                deliveryPrice,
                paymentMethod,
                items: {
                    create: orderItems
                },
                statusHistory: {
                    create: {
                        status: 'PENDING',
                        notes: 'Order created'
                    }
                }
            },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true
                    }
                },
                statusHistory: true
            }
        });
        for (const item of items) {
            if (item.variantId) {
                await this.prisma.productVariant.update({
                    where: { id: item.variantId },
                    data: { stock: { decrement: item.quantity } }
                });
            }
            else {
                await this.prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }
        }
        for (const item of items) {
            await this.prisma.cart.deleteMany({
                where: {
                    userId: userIdStr,
                    productId: item.productId,
                    variantId: item.variantId || null
                }
            });
        }
        await this.trackingService.createTracking(order.id);
        const user = await this.prisma.user.findUnique({ where: { id: userIdStr } });
        if (user?.phone) {
            await this.whatsappService.sendOrderConfirmation(user.phone, order.orderNumber, order.total, order.id, userIdStr);
        }
        await this.abandonedCartService.markCartAsRecovered(userIdStr);
        return order;
    }
    async createOrderWithMpesaPayment(userId, createOrderDto) {
        const order = await this.createOrder(userId, createOrderDto);
        if (createOrderDto.paymentMethod === 'MPESA') {
            const stkResponse = await this.mpesaService.initiateSTKPush(createOrderDto.phoneNumber, order.total, order.id);
            return {
                order,
                payment: stkResponse
            };
        }
        return { order };
    }
    async createOrderFromCart(userId, orderData) {
        const cart = await this.prisma.cart.findMany({
            where: { userId },
            include: {
                product: true,
                variant: true
            }
        });
        if (cart.length === 0) {
            throw new common_1.BadRequestException('Cart is empty');
        }
        const items = cart.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity
        }));
        return this.createOrder(userId, { ...orderData, items });
    }
    async getOrders(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where: { userId },
                include: {
                    items: {
                        include: {
                            product: true,
                            variant: true
                        }
                    },
                    statusHistory: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            this.prisma.order.count({ where: { userId } })
        ]);
        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async getOrderById(userId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true
                    }
                },
                statusHistory: {
                    orderBy: { createdAt: 'desc' }
                },
                returnRequests: {
                    include: {
                        items: true
                    }
                }
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async updateOrderStatus(orderId, updateStatusDto) {
        const { status, notes } = updateStatusDto;
        const order = await this.prisma.order.findUnique({
            where: { id: orderId }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true
                    }
                }
            }
        });
        await this.prisma.orderStatusHistory.create({
            data: {
                orderId,
                status,
                notes
            }
        });
        const user = order.userId ? await this.prisma.user.findUnique({ where: { id: order.userId } }) : null;
        const phoneNumber = user?.phone || order.guestPhone;
        if (phoneNumber && ['CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
            await this.whatsappService.sendDeliveryUpdate(phoneNumber, order.orderNumber, status, notes, orderId, order.userId);
        }
        return updatedOrder;
    }
    async createReturnRequest(userId, orderId, returnRequestDto) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: { items: true }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (!['DELIVERED'].includes(order.status)) {
            throw new common_1.BadRequestException('Returns can only be requested for delivered orders');
        }
        const returnRequest = await this.prisma.returnRequest.create({
            data: {
                orderId,
                userId,
                reason: returnRequestDto.reason,
                description: returnRequestDto.description,
                images: returnRequestDto.images ? JSON.stringify(returnRequestDto.images) : null,
                items: {
                    create: returnRequestDto.items.map(item => ({
                        orderItemId: item.orderItemId,
                        reason: item.reason,
                        condition: item.condition
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        orderItem: {
                            include: {
                                product: true,
                                variant: true
                            }
                        }
                    }
                }
            }
        });
        return returnRequest;
    }
    async getReturnRequests(userId) {
        return this.prisma.returnRequest.findMany({
            where: { userId },
            include: {
                order: true,
                items: {
                    include: {
                        orderItem: {
                            include: {
                                product: true,
                                variant: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async updateReturnRequestStatus(returnRequestId, status, notes) {
        return this.prisma.returnRequest.update({
            where: { id: returnRequestId },
            data: { status },
            include: {
                items: {
                    include: {
                        orderItem: {
                            include: {
                                product: true,
                                variant: true
                            }
                        }
                    }
                }
            }
        });
    }
    async getOrderTracking(userId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: {
                statusHistory: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return {
            orderNumber: order.orderNumber,
            currentStatus: order.status,
            statusHistory: order.statusHistory
        };
    }
    async createGuestOrder(guestCheckoutDto) {
        const { items, email, firstName, lastName, phone, shippingAddress, deliveryLocation, paymentMethod, promoCode, phoneNumber } = guestCheckoutDto;
        const deliveryPrice = await this.deliveryService.calculateDeliveryPrice(deliveryLocation);
        let subtotal = 0;
        const orderItems = [];
        for (const item of items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
                include: { variants: true }
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product ${item.productId} not found`);
            }
            let price = product.price;
            let availableStock = product.stock;
            if (item.variantId) {
                const variant = product.variants.find(v => v.id === item.variantId);
                if (!variant) {
                    throw new common_1.NotFoundException(`Variant ${item.variantId} not found`);
                }
                price = variant.price;
                availableStock = variant.stock;
            }
            if (item.quantity > availableStock) {
                throw new common_1.BadRequestException(`Insufficient stock for ${product.name}`);
            }
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;
            orderItems.push({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                price,
                total: itemTotal
            });
        }
        let discount = 0;
        let promoCodeId = null;
        if (promoCode) {
            const promo = await this.prisma.promoCode.findUnique({
                where: { code: promoCode }
            });
            if (promo && promo.isActive && promo.expiresAt > new Date()) {
                if (promo.minimumAmount && subtotal >= promo.minimumAmount) {
                    if (promo.discountType === 'PERCENTAGE') {
                        discount = (subtotal * promo.discountValue) / 100;
                        if (promo.maxDiscountAmount) {
                            discount = Math.min(discount, promo.maxDiscountAmount);
                        }
                    }
                    else {
                        discount = promo.discountValue;
                    }
                    promoCodeId = promo.id;
                }
            }
        }
        const total = subtotal + deliveryPrice - discount;
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const order = await this.prisma.order.create({
            data: {
                orderNumber,
                subtotal,
                shippingCost: deliveryPrice,
                discount,
                total,
                shippingAddress,
                deliveryLocation,
                deliveryPrice,
                paymentMethod,
                promoCodeId,
                guestEmail: email,
                guestName: `${firstName} ${lastName}`,
                guestPhone: phone,
                items: {
                    create: orderItems
                },
                statusHistory: {
                    create: {
                        status: 'PENDING',
                        notes: 'Guest order created'
                    }
                }
            },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true
                    }
                },
                statusHistory: true
            }
        });
        for (const item of items) {
            if (item.variantId) {
                await this.prisma.productVariant.update({
                    where: { id: item.variantId },
                    data: { stock: { decrement: item.quantity } }
                });
            }
            else {
                await this.prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }
        }
        if (promoCodeId) {
            await this.prisma.promoCode.update({
                where: { id: promoCodeId },
                data: { usedCount: { increment: 1 } }
            });
        }
        await this.trackingService.createTracking(order.id);
        if (phone) {
            await this.whatsappService.sendOrderConfirmation(phone, order.orderNumber, order.total, order.id);
        }
        await this.abandonedCartService.markCartAsRecovered(undefined, undefined, phone);
        if (paymentMethod === 'MPESA' && phoneNumber) {
            const stkResponse = await this.mpesaService.initiateSTKPush(phoneNumber, order.total, order.id);
            return {
                order,
                payment: stkResponse
            };
        }
        return { order };
    }
    async getGuestOrderByNumber(orderNumber, email) {
        const order = await this.prisma.order.findFirst({
            where: {
                orderNumber,
                guestEmail: email
            },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true
                    }
                },
                statusHistory: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mpesa_service_1.MpesaService,
        delivery_service_1.DeliveryService,
        tracking_service_1.TrackingService,
        whatsapp_service_1.WhatsAppService,
        abandoned_cart_service_1.AbandonedCartService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map