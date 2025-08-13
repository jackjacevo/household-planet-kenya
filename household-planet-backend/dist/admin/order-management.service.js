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
exports.OrderManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrderManagementService = class OrderManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrders(filters = {}) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.paymentStatus)
            where.paymentStatus = filters.paymentStatus;
        if (filters.dateFrom)
            where.createdAt = { gte: new Date(filters.dateFrom) };
        if (filters.dateTo)
            where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };
        if (filters.search) {
            where.OR = [
                { orderNumber: { contains: filters.search } },
                { guestEmail: { contains: filters.search } },
                { user: { email: { contains: filters.search } } }
            ];
        }
        return this.prisma.order.findMany({
            where,
            include: {
                user: { select: { name: true, email: true, phone: true } },
                items: { include: { product: true, variant: true } },
                payments: true,
                deliveryTracking: true,
                statusHistory: { orderBy: { createdAt: 'desc' } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getOrderById(id) {
        return this.prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                items: { include: { product: true, variant: true } },
                payments: true,
                deliveryTracking: { include: { updates: { orderBy: { timestamp: 'desc' } } } },
                statusHistory: { orderBy: { createdAt: 'desc' } },
                returnRequests: { include: { items: true } }
            }
        });
    }
    async updateOrderStatus(id, status, notes) {
        const [order, statusHistory] = await Promise.all([
            this.prisma.order.update({
                where: { id },
                data: { status }
            }),
            this.prisma.orderStatusHistory.create({
                data: { orderId: id, status, notes }
            })
        ]);
        if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
            await this.updateDeliveryStatus(id, status);
        }
        return { order, statusHistory };
    }
    async bulkUpdateOrders(orderIds, updates) {
        const results = [];
        for (const orderId of orderIds) {
            if (updates.status) {
                const result = await this.updateOrderStatus(orderId, updates.status, updates.notes);
                results.push(result);
            }
            else {
                const result = await this.prisma.order.update({
                    where: { id: orderId },
                    data: updates
                });
                results.push(result);
            }
        }
        return results;
    }
    async verifyPayment(orderId) {
        const payment = await this.prisma.payment.findFirst({
            where: { orderId },
            orderBy: { createdAt: 'desc' }
        });
        if (payment && payment.status === 'COMPLETED') {
            await this.prisma.order.update({
                where: { id: orderId },
                data: { paymentStatus: 'PAID' }
            });
            return { verified: true, payment };
        }
        return { verified: false, payment };
    }
    async generateShippingLabel(orderId) {
        const order = await this.getOrderById(orderId);
        if (!order)
            throw new Error('Order not found');
        const labelData = {
            orderNumber: order.orderNumber,
            customerName: order.user?.name || order.guestName,
            shippingAddress: order.shippingAddress,
            deliveryLocation: order.deliveryLocation,
            items: order.items.map(item => ({
                name: item.product.name,
                quantity: item.quantity,
                weight: item.product.weight
            })),
            totalWeight: order.items.reduce((sum, item) => sum + (item.product.weight || 0) * item.quantity, 0),
            trackingNumber: `HP${Date.now()}`
        };
        await this.prisma.deliveryTracking.upsert({
            where: { orderId },
            create: {
                orderId,
                status: 'LABEL_GENERATED',
                notes: `Shipping label generated: ${labelData.trackingNumber}`
            },
            update: {
                status: 'LABEL_GENERATED',
                notes: `Shipping label generated: ${labelData.trackingNumber}`
            }
        });
        return labelData;
    }
    async updateDeliveryStatus(orderId, status, location, notes) {
        const deliveryStatus = {
            'SHIPPED': 'SHIPPED',
            'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
            'DELIVERED': 'DELIVERED'
        }[status] || 'IN_TRANSIT';
        const tracking = await this.prisma.deliveryTracking.upsert({
            where: { orderId },
            create: {
                orderId,
                status: deliveryStatus,
                location,
                notes
            },
            update: {
                status: deliveryStatus,
                location,
                notes,
                deliveredAt: status === 'DELIVERED' ? new Date() : undefined
            }
        });
        await this.prisma.deliveryUpdate.create({
            data: {
                trackingId: tracking.id,
                status: deliveryStatus,
                location,
                notes
            }
        });
        return tracking;
    }
    async addOrderNote(orderId, notes) {
        return this.prisma.orderStatusHistory.create({
            data: {
                orderId,
                status: 'NOTE',
                notes
            }
        });
    }
    async processReturn(returnId, status, notes) {
        const returnRequest = await this.prisma.returnRequest.update({
            where: { id: returnId },
            data: { status, description: notes },
            include: { order: true, items: { include: { orderItem: true } } }
        });
        if (status === 'APPROVED') {
            await this.updateOrderStatus(returnRequest.orderId, 'RETURNED', 'Return approved');
            for (const item of returnRequest.items) {
                await this.prisma.product.update({
                    where: { id: item.orderItem.productId },
                    data: { stock: { increment: item.orderItem.quantity } }
                });
            }
        }
        return returnRequest;
    }
    async getOrderStats() {
        const [total, pending, processing, shipped, delivered, cancelled] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.order.count({ where: { status: 'PENDING' } }),
            this.prisma.order.count({ where: { status: 'PROCESSING' } }),
            this.prisma.order.count({ where: { status: 'SHIPPED' } }),
            this.prisma.order.count({ where: { status: 'DELIVERED' } }),
            this.prisma.order.count({ where: { status: 'CANCELLED' } })
        ]);
        return { total, pending, processing, shipped, delivered, cancelled };
    }
    async sendCustomerEmail(orderId, template, customMessage) {
        const order = await this.getOrderById(orderId);
        if (!order)
            throw new Error('Order not found');
        const templates = {
            'order_confirmed': {
                subject: `Order Confirmation - ${order.orderNumber}`,
                message: `Your order has been confirmed and is being processed.`
            },
            'order_shipped': {
                subject: `Order Shipped - ${order.orderNumber}`,
                message: `Your order has been shipped and is on its way.`
            },
            'order_delivered': {
                subject: `Order Delivered - ${order.orderNumber}`,
                message: `Your order has been delivered successfully.`
            },
            'custom': {
                subject: `Update on Order ${order.orderNumber}`,
                message: customMessage || 'We have an update on your order.'
            }
        };
        const emailTemplate = templates[template];
        const customerEmail = order.user?.email || order.guestEmail;
        console.log(`Sending email to ${customerEmail}:`, emailTemplate);
        return {
            sent: true,
            recipient: customerEmail,
            subject: emailTemplate.subject,
            message: emailTemplate.message
        };
    }
};
exports.OrderManagementService = OrderManagementService;
exports.OrderManagementService = OrderManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrderManagementService);
//# sourceMappingURL=order-management.service.js.map