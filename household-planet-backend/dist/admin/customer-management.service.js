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
exports.CustomerManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CustomerManagementService = class CustomerManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCustomers(filters = {}) {
        const where = { role: 'CUSTOMER' };
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search } },
                { email: { contains: filters.search } },
                { phone: { contains: filters.search } }
            ];
        }
        if (filters.isActive !== undefined)
            where.isActive = filters.isActive === 'true';
        if (filters.dateFrom)
            where.createdAt = { gte: new Date(filters.dateFrom) };
        if (filters.dateTo)
            where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };
        return this.prisma.user.findMany({
            where,
            include: {
                orders: { select: { id: true, total: true, status: true, createdAt: true } },
                addresses: true,
                supportTickets: { select: { id: true, status: true } },
                loyaltyTransactions: { select: { points: true, type: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getCustomerById(id) {
        return this.prisma.user.findUnique({
            where: { id, role: 'CUSTOMER' },
            include: {
                orders: {
                    include: {
                        items: { include: { product: true } },
                        payments: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                addresses: true,
                supportTickets: {
                    include: { replies: true },
                    orderBy: { createdAt: 'desc' }
                },
                loyaltyTransactions: { orderBy: { createdAt: 'desc' } },
                reviews: { include: { product: true } }
            }
        });
    }
    async updateCustomer(id, data) {
        return this.prisma.user.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    }
    async getCustomerStats() {
        const [total, active, inactive, newThisMonth, topSpenders] = await Promise.all([
            this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
            this.prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } }),
            this.prisma.user.count({ where: { role: 'CUSTOMER', isActive: false } }),
            this.prisma.user.count({
                where: {
                    role: 'CUSTOMER',
                    createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                }
            }),
            this.prisma.user.findMany({
                where: { role: 'CUSTOMER' },
                orderBy: { totalSpent: 'desc' },
                take: 5,
                select: { id: true, name: true, email: true, totalSpent: true }
            })
        ]);
        return { total, active, inactive, newThisMonth, topSpenders };
    }
    async segmentCustomers(criteria) {
        const segments = {
            'high_value': { totalSpent: { gte: 50000 } },
            'frequent_buyers': {},
            'new_customers': { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
            'inactive': { lastLoginAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } }
        };
        const segment = segments[criteria.type];
        if (!segment)
            return [];
        return this.prisma.user.findMany({
            where: { role: 'CUSTOMER', ...segment },
            include: {
                orders: { select: { total: true, createdAt: true } }
            }
        });
    }
    async addCustomerTag(customerId, tag) {
        return { message: 'Tags functionality requires database schema update' };
    }
    async removeCustomerTag(customerId, tag) {
        return { message: 'Tags functionality requires database schema update' };
    }
    async manageLoyaltyPoints(customerId, points, type, description) {
        const [transaction, user] = await Promise.all([
            this.prisma.loyaltyTransaction.create({
                data: {
                    userId: customerId,
                    points,
                    type,
                    description
                }
            }),
            this.prisma.user.update({
                where: { id: customerId },
                data: {
                    loyaltyPoints: type === 'REDEEMED' ? { decrement: Math.abs(points) } : { increment: points }
                }
            })
        ]);
        return { transaction, user };
    }
    async createSupportTicket(customerId, data) {
        return this.prisma.supportTicket.create({
            data: {
                userId: customerId,
                subject: data.subject,
                message: data.message,
                category: data.category,
                priority: data.priority || 'MEDIUM',
                orderId: data.orderId
            }
        });
    }
    async updateSupportTicket(ticketId, data) {
        return this.prisma.supportTicket.update({
            where: { id: ticketId },
            data: {
                ...data,
                updatedAt: new Date()
            }
        });
    }
    async addTicketReply(ticketId, message, isStaff = true) {
        return this.prisma.supportTicketReply.create({
            data: {
                ticketId,
                message,
                isStaff
            }
        });
    }
    async verifyAddress(customerId, addressId) {
        const address = await this.prisma.address.findUnique({
            where: { id: addressId, userId: customerId }
        });
        if (!address)
            throw new Error('Address not found');
        const isValid = address.street && address.town && address.county;
        return {
            isValid,
            address,
            suggestions: isValid ? [] : ['Please provide complete address details']
        };
    }
    async getCustomerCommunicationLog(customerId) {
        const [supportTickets, orderHistory, loyaltyTransactions] = await Promise.all([
            this.prisma.supportTicket.findMany({
                where: { userId: customerId },
                include: { replies: true },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.orderStatusHistory.findMany({
                where: {
                    order: { userId: customerId }
                },
                include: { order: { select: { orderNumber: true } } },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.loyaltyTransaction.findMany({
                where: { userId: customerId },
                orderBy: { createdAt: 'desc' }
            })
        ]);
        const communications = [
            ...supportTickets.map(ticket => ({
                type: 'support',
                id: ticket.id,
                subject: ticket.subject,
                status: ticket.status,
                createdAt: ticket.createdAt,
                replies: ticket.replies.length
            })),
            ...orderHistory.map(history => ({
                type: 'order',
                id: history.id,
                subject: `Order ${history.order.orderNumber} - ${history.status}`,
                status: history.status,
                createdAt: history.createdAt,
                notes: history.notes
            })),
            ...loyaltyTransactions.map(transaction => ({
                type: 'loyalty',
                id: transaction.id,
                subject: transaction.description,
                status: transaction.type,
                createdAt: transaction.createdAt,
                points: transaction.points
            }))
        ];
        return communications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getCustomerInsights(customerId) {
        const customer = await this.getCustomerById(customerId);
        if (!customer)
            return null;
        const totalOrders = customer.orders.length;
        const totalSpent = customer.totalSpent;
        const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
        const lastOrderDate = customer.orders[0]?.createdAt;
        const daysSinceLastOrder = lastOrderDate ?
            Math.floor((Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)) : null;
        const ordersByStatus = customer.orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});
        const favoriteProducts = customer.orders
            .flatMap(order => order.items)
            .reduce((acc, item) => {
            const productName = item.product.name;
            acc[productName] = (acc[productName] || 0) + item.quantity;
            return acc;
        }, {});
        return {
            totalOrders,
            totalSpent,
            avgOrderValue,
            daysSinceLastOrder,
            ordersByStatus,
            favoriteProducts: Object.entries(favoriteProducts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([name, quantity]) => ({ name, quantity })),
            loyaltyPoints: customer.loyaltyPoints,
            supportTickets: customer.supportTickets.length,
            addresses: customer.addresses.length,
            reviews: customer.reviews.length
        };
    }
};
exports.CustomerManagementService = CustomerManagementService;
exports.CustomerManagementService = CustomerManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomerManagementService);
//# sourceMappingURL=customer-management.service.js.map