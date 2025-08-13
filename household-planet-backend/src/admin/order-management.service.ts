import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderManagementService {
  constructor(private prisma: PrismaService) {}

  async getOrders(filters: any = {}) {
    const where: any = {};
    
    if (filters.status) where.status = filters.status;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
    if (filters.dateFrom) where.createdAt = { gte: new Date(filters.dateFrom) };
    if (filters.dateTo) where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };
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

  async getOrderById(id: string) {
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

  async updateOrderStatus(id: string, status: string, notes?: string) {
    const [order, statusHistory] = await Promise.all([
      this.prisma.order.update({
        where: { id },
        data: { status }
      }),
      this.prisma.orderStatusHistory.create({
        data: { orderId: id, status, notes }
      })
    ]);

    // Update delivery tracking if needed
    if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
      await this.updateDeliveryStatus(id, status);
    }

    return { order, statusHistory };
  }

  async bulkUpdateOrders(orderIds: string[], updates: any) {
    const results = [];
    for (const orderId of orderIds) {
      if (updates.status) {
        const result = await this.updateOrderStatus(orderId, updates.status, updates.notes);
        results.push(result);
      } else {
        const result = await this.prisma.order.update({
          where: { id: orderId },
          data: updates
        });
        results.push(result);
      }
    }
    return results;
  }

  async verifyPayment(orderId: string) {
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

  async generateShippingLabel(orderId: string) {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

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

    // Create or update delivery tracking
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

  async updateDeliveryStatus(orderId: string, status: string, location?: string, notes?: string) {
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

    // Add delivery update
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

  async addOrderNote(orderId: string, notes: string) {
    return this.prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: 'NOTE',
        notes
      }
    });
  }

  async processReturn(returnId: string, status: 'APPROVED' | 'REJECTED', notes?: string) {
    const returnRequest = await this.prisma.returnRequest.update({
      where: { id: returnId },
      data: { status, description: notes },
      include: { order: true, items: { include: { orderItem: true } } }
    });

    if (status === 'APPROVED') {
      // Update order status
      await this.updateOrderStatus(returnRequest.orderId, 'RETURNED', 'Return approved');
      
      // Restore inventory
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

  async sendCustomerEmail(orderId: string, template: string, customMessage?: string) {
    const order = await this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

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

    // In a real implementation, you would send the actual email here
    console.log(`Sending email to ${customerEmail}:`, emailTemplate);

    return {
      sent: true,
      recipient: customerEmail,
      subject: emailTemplate.subject,
      message: emailTemplate.message
    };
  }
}