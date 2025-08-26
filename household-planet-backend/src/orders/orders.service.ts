import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryService } from '../delivery/delivery.service';
import { CustomersService } from '../customers/customers.service';
import { LoyaltyService } from '../customers/loyalty.service';
import { ShippingService } from './shipping.service';
import { CreateOrderDto, UpdateOrderStatusDto, CreateReturnDto, BulkOrderUpdateDto, OrderFilterDto, AddOrderNoteDto, SendCustomerEmailDto, ProcessReturnDto } from './dto/order.dto';
import { OrderStatus } from '../common/enums';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly FREE_SHIPPING_THRESHOLD = 5000;
  private readonly DEFAULT_SHIPPING_COST = 200;
  private readonly URGENT_ORDER_HOURS = 24 * 60 * 60 * 1000;
  
  private readonly EMAIL_TEMPLATES = {
    order_confirmation: {
      subject: (orderNumber: string) => `Order Confirmation - ${orderNumber}`,
      message: (customerName: string, orderNumber: string) => 
        `Dear ${customerName}, your order ${orderNumber} has been confirmed and is being processed.`
    },
    shipping_notification: {
      subject: (orderNumber: string) => `Your order is on the way - ${orderNumber}`,
      message: (customerName: string, orderNumber: string) => 
        `Dear ${customerName}, your order ${orderNumber} has been shipped and is on its way to you.`
    },
    delivery_confirmation: {
      subject: (orderNumber: string) => `Order Delivered - ${orderNumber}`,
      message: (customerName: string, orderNumber: string) => 
        `Dear ${customerName}, your order ${orderNumber} has been successfully delivered.`
    }
  };

  constructor(
    private prisma: PrismaService,
    private deliveryService: DeliveryService,
    private customersService: CustomersService,
    private loyaltyService: LoyaltyService,
    private shippingService: ShippingService
  ) {}

  async findAll(filters?: OrderFilterDto) {
    try {
      const where: Prisma.OrderWhereInput = {};
      
      if (filters?.status) where.status = filters.status;
      if (filters?.customerEmail) {
        where.user = { email: { contains: filters.customerEmail } };
      }
      if (filters?.orderNumber) {
        where.orderNumber = { contains: filters.orderNumber };
      }
      if (filters?.startDate && filters?.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          where.createdAt = { gte: startDate, lte: endDate };
        }
      }
      if (filters?.returnable) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        where.status = 'DELIVERED';
        where.createdAt = { gte: thirtyDaysAgo };
      }
      // Add source filter for WhatsApp orders
      if (filters?.source) {
        where.source = filters.source;
      }

      const page = Math.max(1, filters?.page || 1);
      const limit = Math.min(100, Math.max(1, filters?.limit || 20));
      const skip = (page - 1) * limit;

      this.logger.debug(`Finding orders with filters: ${JSON.stringify(filters)}, where: ${JSON.stringify(where)}`);

      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          include: {
            user: { select: { name: true, email: true, phone: true } },
            items: {
              include: {
                product: { select: { name: true, images: true } },
                variant: { select: { name: true, sku: true } },
              },
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
        this.prisma.order.count({ where })
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
    } catch (error) {
      this.logger.error('Error in findAll orders:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch orders: ' + error.message);
    }
  }

  async findByUser(userId: number, filters?: { status?: string; returnable?: boolean }) {
    try {
      const where: Prisma.OrderWhereInput = { userId };
      
      if (filters?.returnable) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        where.status = 'DELIVERED';
        where.createdAt = { gte: thirtyDaysAgo };
      } else if (filters?.status) {
        where.status = filters.status as OrderStatus;
      }
      
      this.logger.debug(`Finding orders for user ${userId} with filters:`, filters);
      
      const orders = await this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return { orders };
    } catch (error) {
      this.logger.error('Error in findByUser:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch user orders: ' + error.message);
    }
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        notes: {
          orderBy: { createdAt: 'desc' }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        },
        communications: {
          orderBy: { sentAt: 'desc' }
        },
        delivery: {
          include: {
            statusHistory: true
          }
        },
        paymentTransactions: true,
        returnRequests: {
          include: {
            items: {
              include: {
                orderItem: {
                  include: {
                    product: true
                  }
                }
              }
            }
          }
        }
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(userId: number, dto: CreateOrderDto) {
    // Batch validate stock for all variants
    const variantIds = dto.items.filter(item => item.variantId).map(item => item.variantId!);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, stock: true }
    });
    
    const variantStockMap = new Map(variants.map(v => [v.id, v.stock]));
    
    for (const item of dto.items) {
      if (item.variantId) {
        const stock = variantStockMap.get(item.variantId);
        if (stock === undefined || stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product variant ${item.variantId}`);
        }
      } else {
        // Validate base product stock
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true }
        });
        if (!product) {
          throw new BadRequestException(`Product ${item.productId} not found`);
        }
      }
    }

    const subtotal = dto.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate delivery cost - prioritize manual delivery price
    let shippingCost = 0;
    
    if (dto.deliveryPrice !== undefined && dto.deliveryPrice >= 0) {
      // Use manual delivery price if provided
      shippingCost = dto.deliveryPrice;
    } else if (dto.deliveryLocationId) {
      // Get the specific delivery location and use its price
      const deliveryLocation = this.deliveryService.getAllLocations().find(loc => loc.id === dto.deliveryLocationId);
      
      if (deliveryLocation) {
        shippingCost = deliveryLocation.price;
        
        // Apply free shipping ONLY if order value is above threshold
        if (subtotal >= this.FREE_SHIPPING_THRESHOLD) {
          shippingCost = 0;
        }
      } else {
        throw new BadRequestException('Invalid delivery location selected');
      }
    } else {
      shippingCost = subtotal >= this.FREE_SHIPPING_THRESHOLD ? 0 : this.DEFAULT_SHIPPING_COST;
    }
    
    const total = subtotal + shippingCost;

    // Create order in transaction to ensure inventory is updated
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          user: { connect: { id: userId } },
          orderNumber: `HP-${Date.now()}`,
          subtotal,
          shippingCost,
          total,
          shippingAddress: JSON.stringify({
            fullName: 'Customer',
            phone: '',
            street: dto.deliveryLocation || '',
            town: dto.deliveryLocation || '',
            county: 'Kenya'
          }),
          deliveryLocation: dto.deliveryLocation || dto.deliveryLocationId,
          deliveryPrice: shippingCost,
          paymentMethod: dto.paymentMethod,
          items: {
            create: dto.items.map(item => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true,
              variant: true
            }
          }
        }
      });

      // Batch update inventory
      const inventoryUpdates = dto.items
        .filter(item => item.variantId)
        .map(item => 
          tx.productVariant.update({
            where: { id: item.variantId! },
            data: { stock: { decrement: item.quantity } }
          })
        );
      
      await Promise.all(inventoryUpdates);

      // Clear user's cart
      await tx.cart.deleteMany({ where: { userId } });

      return order;
    });
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto, userId?: string) {
    try {
      this.logger.debug(`Updating order ${id} status to ${dto.status} by ${userId}`);
      
      const order = await this.prisma.order.findUnique({ where: { id } });
      if (!order) {
        this.logger.error(`Order ${id} not found`);
        throw new NotFoundException('Order not found');
      }

      this.logger.debug(`Found order ${id}, current status: ${order.status}`);

      // Update order status first
      const updatedOrder = await this.prisma.order.update({
        where: { id },
        data: { 
          status: dto.status,
          ...(dto.trackingNumber && { trackingNumber: dto.trackingNumber })
        },
        include: {
          user: { select: { name: true, email: true } },
          items: {
            include: {
              product: true,
              variant: true
            }
          }
        }
      });

      this.logger.debug(`Order ${id} status updated successfully`);

      // Add status history (separate operation)
      try {
        await this.prisma.orderStatusHistory.create({
          data: {
            orderId: id,
            status: dto.status,
            notes: dto.notes || '',
            changedBy: userId || 'system'
          }
        });
        this.logger.debug(`Status history created for order ${id}`);
      } catch (historyError) {
        this.logger.error(`Error creating status history for order ${id}:`, historyError.message);
      }

      // Handle delivered status updates asynchronously
      if (dto.status === 'DELIVERED') {
        // Run these in background without blocking the response
        setImmediate(async () => {
          try {
            await Promise.all([
              this.customersService.updateCustomerStats(updatedOrder.userId),
              this.loyaltyService.earnPoints(updatedOrder.userId, updatedOrder.id, Number(updatedOrder.total))
            ]);
            this.logger.debug(`Customer stats and loyalty points updated for order ${id}`);
          } catch (error) {
            this.logger.error('Error updating customer stats or loyalty points', error.stack, 'OrdersService');
          }
        });
      }

      return updatedOrder;
    } catch (error) {
      this.logger.error(`Error updating order status for order ${id}:`, error.message, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update order status: ${error.message}`);
    }
  }

  async createReturn(userId: number, dto: CreateReturnDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, userId },
      include: { items: true }
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Can only return delivered orders');
    }

    // Create proper return request
    const returnNumber = `RET-${Date.now()}-${randomBytes(2).toString('hex').toUpperCase()}`;
    
    return this.prisma.returnRequest.create({
      data: {
        returnNumber,
        orderId: dto.orderId,
        type: 'RETURN',
        reason: dto.reason,
        preferredResolution: dto.preferredResolution || 'REFUND',
        items: {
          create: dto.items.map(item => ({
            orderItemId: item.orderItemId,
            quantity: item.quantity || 1,
            reason: item.reason
          }))
        }
      },
      include: {
        items: {
          include: {
            orderItem: {
              include: { product: true }
            }
          }
        }
      }
    });
  }

  async getOrderTracking(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        total: true,
        paymentMethod: true,
        deliveryLocation: true,
        trackingNumber: true
      }
    });

    if (!order) throw new NotFoundException('Order not found');

    let trackingInfo = null;
    if (order.trackingNumber) {
      try {
        trackingInfo = await this.shippingService.getTrackingInfo(order.trackingNumber);
      } catch (error) {
        this.logger.warn(`Could not get tracking info for ${order.trackingNumber}`);
      }
    }

    const statusHistory = [
      { status: 'PENDING', date: order.createdAt, completed: true, description: 'Order placed successfully' },
      { status: 'CONFIRMED', date: order.status !== 'PENDING' ? order.updatedAt : null, completed: order.status !== 'PENDING', description: 'Order confirmed and being prepared' },
      { status: 'PROCESSING', date: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) ? order.updatedAt : null, completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status), description: 'Order is being processed' },
      { status: 'SHIPPED', date: ['SHIPPED', 'DELIVERED'].includes(order.status) ? order.updatedAt : null, completed: ['SHIPPED', 'DELIVERED'].includes(order.status), description: 'Order has been shipped' },
      { status: 'DELIVERED', date: order.status === 'DELIVERED' ? order.updatedAt : null, completed: order.status === 'DELIVERED', description: 'Order delivered successfully' }
    ];

    return { order, statusHistory, trackingInfo };
  }

  async getOrderStats() {
    const [totalOrders, totalRevenue, statusCounts] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } }
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { id: true }
      })
    ]);
    
    const statusMap = new Map(statusCounts.map(s => [s.status, s._count.id]));
    const pendingOrders = statusMap.get('PENDING') || 0;
    const deliveredOrders = statusMap.get('DELIVERED') || 0;
    const processingOrders = statusMap.get('PROCESSING') || 0;
    const shippedOrders = statusMap.get('SHIPPED') || 0;

    const recentOrders = await this.prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    const urgentOrders = await this.prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        createdAt: { lt: new Date(Date.now() - this.URGENT_ORDER_HOURS) }
      },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'asc' },
      take: 5
    });

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
      deliveredOrders,
      processingOrders,
      shippedOrders,
      recentOrders,
      urgentOrders
    };
  }

  async getInventoryReport() {
    const lowStockVariants = await this.prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      include: {
        product: { select: { name: true, sku: true } }
      },
      orderBy: { stock: 'asc' }
    });
    
    const outOfStockVariants = lowStockVariants.filter(v => v.stock === 0);
    const lowStockOnly = lowStockVariants.filter(v => v.stock > 0);

    return {
      lowStockVariants: lowStockOnly,
      outOfStockVariants,
      lowStockCount: lowStockOnly.length,
      outOfStockCount: outOfStockVariants.length
    };
  }

  async getSalesReport(startDate?: Date, endDate?: Date) {
    const where: any = { status: 'DELIVERED' };
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate
      };
    }

    const [orders, topProducts] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: where
        },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 10
      })
    ]);

    const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      topProducts,
      orders
    };
  }

  async generateInvoice(userId: number, orderId: string) {
    const orderIdNum = parseInt(orderId, 10);
    if (isNaN(orderIdNum)) {
      throw new BadRequestException('Invalid order ID');
    }
    
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderIdNum,
        userId,
        status: 'DELIVERED'
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        user: true
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found or not eligible for invoice');
    }

    // In a real implementation, you would generate a PDF here
    // For now, return mock PDF data
    const mockPdf = Buffer.from('Mock PDF content for invoice');
    
    return {
      orderNumber: order.orderNumber,
      pdf: mockPdf
    };
  }

  async generateBulkInvoices(userId: number, orderIds: string[]) {
    const orderIdNums = orderIds.map(id => {
      const num = parseInt(id, 10);
      if (isNaN(num)) throw new BadRequestException(`Invalid order ID: ${id}`);
      return num;
    });
    
    // Validate orders belong to user and are eligible
    const orders = await this.prisma.order.findMany({
      where: {
        id: { in: orderIdNums },
        userId,
        status: 'DELIVERED'
      }
    });
    
    if (orders.length !== orderIdNums.length) {
      throw new BadRequestException('Some orders are not eligible for invoice generation');
    }
    
    const mockZip = Buffer.from('Mock ZIP content with multiple invoices');
    return mockZip;
  }

  async bulkUpdateOrders(dto: BulkOrderUpdateDto, userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const orders = await tx.order.updateMany({
        where: { id: { in: dto.orderIds } },
        data: { status: dto.status }
      });

      // Add status history for each order
      await Promise.all(
        dto.orderIds.map(orderId => 
          tx.orderStatusHistory.create({
            data: {
              orderId,
              status: dto.status,
              notes: dto.notes,
              changedBy: userId
            }
          })
        )
      );

      return orders;
    });
  }

  async addOrderNote(orderId: number, dto: AddOrderNoteDto, userId?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    
    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { email: userId } });
      if (!user) throw new BadRequestException('Invalid user');
    }

    return this.prisma.orderNote.create({
      data: {
        orderId,
        note: dto.note,
        isInternal: dto.isInternal,
        createdBy: userId
      }
    });
  }

  async getOrderNotes(orderId: number) {
    return this.prisma.orderNote.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async sendCustomerEmail(orderId: number, dto: SendCustomerEmailDto, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });
    
    if (!order) throw new NotFoundException('Order not found');

    let template: { subject: string; message: string };
    
    if (dto.template === 'custom') {
      template = {
        subject: dto.subject || `Update on your order - ${order.orderNumber}`,
        message: dto.customMessage || 'We have an update on your order.'
      };
    } else if (this.EMAIL_TEMPLATES[dto.template]) {
      const tmpl = this.EMAIL_TEMPLATES[dto.template];
      template = {
        subject: tmpl.subject(order.orderNumber),
        message: tmpl.message(order.user.name, order.orderNumber)
      };
    } else {
      template = {
        subject: `Update on your order - ${order.orderNumber}`,
        message: 'We have an update on your order.'
      };
    }
    
    // In a real implementation, you would send the actual email here
    // For now, just log the communication
    await this.prisma.orderCommunication.create({
      data: {
        orderId,
        type: 'EMAIL',
        template: dto.template,
        subject: template.subject,
        message: template.message,
        sentBy: userId
      }
    });

    return { success: true, message: 'Email sent successfully' };
  }

  async generateShippingLabel(orderId: number) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    
    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      throw new BadRequestException('Cannot generate label for delivered or cancelled orders');
    }

    const shippingLabel = await this.shippingService.generateShippingLabel(orderId);
    
    // Start simulated tracking updates for demo
    await this.shippingService.simulateTrackingUpdates(shippingLabel.trackingNumber);
    
    return shippingLabel;
  }

  async getOrderAnalytics(startDate?: Date, endDate?: Date) {
    const where: Prisma.OrderWhereInput = {};
    if (startDate && endDate) {
      where.createdAt = { gte: startDate, lte: endDate };
    }

    const [ordersByStatus, ordersByPaymentMethod] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
        _sum: { total: true }
      }),
      this.prisma.order.groupBy({
        by: ['paymentMethod'],
        where,
        _count: { id: true },
        _sum: { total: true }
      })
    ]);

    // Get daily orders using Prisma groupBy instead of raw SQL
    const dailyOrdersData = await this.prisma.order.findMany({
      where,
      select: {
        createdAt: true,
        total: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by date in memory
    const dailyOrders = dailyOrdersData.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, orders: 0, revenue: 0 };
      }
      acc[date].orders += 1;
      acc[date].revenue += Number(order.total);
      return acc;
    }, {} as Record<string, { date: string; orders: number; revenue: number }>);

    return {
      ordersByStatus,
      ordersByPaymentMethod,
      dailyOrders: Object.values(dailyOrders)
    };
  }

  async getReturnRequests(filters?: { status?: string; orderId?: number }) {
    const where: Prisma.ReturnRequestWhereInput = {};
    
    if (filters?.status) where.status = filters.status;
    if (filters?.orderId) where.orderId = filters.orderId;

    return this.prisma.returnRequest.findMany({
      where,
      include: {
        order: {
          select: {
            orderNumber: true,
            user: { select: { name: true, email: true } }
          }
        },
        items: {
          include: {
            orderItem: {
              include: { product: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async processReturn(dto: ProcessReturnDto, userId?: string) {
    const returnRequest = await this.prisma.returnRequest.findUnique({
      where: { id: dto.returnId },
      include: {
        order: true,
        items: {
          include: {
            orderItem: {
              include: { variant: true }
            }
          }
        }
      }
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update return status
      const updatedReturn = await tx.returnRequest.update({
        where: { id: dto.returnId },
        data: { status: dto.status }
      });

      if (dto.status === 'APPROVED') {
        // Restore inventory for returned items
        for (const item of returnRequest.items) {
          if (item.orderItem.variantId) {
            await tx.productVariant.update({
              where: { id: item.orderItem.variantId },
              data: {
                stock: { increment: item.quantity }
              }
            });
          }
        }

        // Create refund record if needed
        if (dto.refundAmount) {
          await tx.paymentTransaction.create({
            data: {
              orderId: returnRequest.orderId,
              checkoutRequestId: `REFUND-${Date.now()}`,
              phoneNumber: 'N/A',
              amount: dto.refundAmount,
              status: 'COMPLETED',
              provider: 'REFUND',
              resultDescription: `Refund for return ${returnRequest.returnNumber}`
            }
          });
        }
      }

      // Add processing note
      await tx.orderNote.create({
        data: {
          orderId: returnRequest.orderId,
          note: `Return ${dto.status.toLowerCase()}: ${dto.notes || 'No additional notes'}`,
          isInternal: true,
          createdBy: userId
        }
      });

      return updatedReturn;
    });
  }
}