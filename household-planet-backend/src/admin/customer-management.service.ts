import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerManagementService {
  constructor(private prisma: PrismaService) {}

  async getCustomers(filters: any = {}) {
    const where: any = { role: 'CUSTOMER' };
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { email: { contains: filters.search } },
        { phone: { contains: filters.search } }
      ];
    }
    if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';
    if (filters.dateFrom) where.createdAt = { gte: new Date(filters.dateFrom) };
    if (filters.dateTo) where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };

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

  async getCustomerById(id: string) {
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

  async updateCustomer(id: string, data: any) {
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

  async segmentCustomers(criteria: any) {
    const segments = {
      'high_value': { totalSpent: { gte: 50000 } },
      'frequent_buyers': {},
      'new_customers': { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      'inactive': { lastLoginAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } }
    };

    const segment = segments[criteria.type];
    if (!segment) return [];

    return this.prisma.user.findMany({
      where: { role: 'CUSTOMER', ...segment },
      include: {
        orders: { select: { total: true, createdAt: true } }
      }
    });
  }

  async addCustomerTag(customerId: string, tag: string) {
    // Tags functionality would require adding a tags field to the User model
    // For now, return a placeholder response
    return { message: 'Tags functionality requires database schema update' };
  }

  async removeCustomerTag(customerId: string, tag: string) {
    // Tags functionality would require adding a tags field to the User model
    // For now, return a placeholder response
    return { message: 'Tags functionality requires database schema update' };
  }

  async manageLoyaltyPoints(customerId: string, points: number, type: string, description: string) {
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

  async createSupportTicket(customerId: string, data: any) {
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

  async updateSupportTicket(ticketId: string, data: any) {
    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  async addTicketReply(ticketId: string, message: string, isStaff = true) {
    return this.prisma.supportTicketReply.create({
      data: {
        ticketId,
        message,
        isStaff
      }
    });
  }

  async verifyAddress(customerId: string, addressId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId, userId: customerId }
    });

    if (!address) throw new Error('Address not found');

    // Simple address verification logic
    const isValid = address.street && address.town && address.county;
    
    return {
      isValid,
      address,
      suggestions: isValid ? [] : ['Please provide complete address details']
    };
  }

  async getCustomerCommunicationLog(customerId: string) {
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

  async getCustomerInsights(customerId: string) {
    const customer = await this.getCustomerById(customerId);
    if (!customer) return null;

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
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([name, quantity]) => ({ name, quantity })),
      loyaltyPoints: customer.loyaltyPoints,
      supportTickets: customer.supportTickets.length,
      addresses: customer.addresses.length,
      reviews: customer.reviews.length
    };
  }
}