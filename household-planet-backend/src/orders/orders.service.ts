import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryService } from '../delivery/delivery.service';
import { CustomersService } from '../customers/customers.service';
import { LoyaltyService } from '../customers/loyalty.service';
import { ShippingService } from './shipping.service';
import { OrderIdService } from './order-id.service';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import { NotificationsService } from '../notifications/notifications.service';
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
    private shippingService: ShippingService,
    private orderIdService: OrderIdService,
    private promoCodesService: PromoCodesService,
    private notificationsService: NotificationsService
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
            user: { 
              select: { 
                id: true,
                name: true, 
                email: true, 
                phone: true,
                firstName: true,
                lastName: true,
                createdAt: true
              } 
            },
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
        user: { 
          select: { 
            id: true,
            name: true, 
            email: true, 
            phone: true,
            firstName: true,
            lastName: true,
            phoneVerified: true,
            createdAt: true
          } 
        },
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

  async createGuestOrder(dto: CreateOrderDto) {
    // Validate required customer information for guest orders
    if (!dto.customerName || dto.customerName.trim() === '') {
      throw new BadRequestException('Customer name is required for guest orders');
    }
    if (!dto.customerPhone || dto.customerPhone.trim() === '') {
      throw new BadRequestException('Customer phone is required for guest orders');
    }

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
    let deliveryLocation = null;
    
    if (dto.deliveryPrice !== undefined && dto.deliveryPrice >= 0) {
      // Use manual delivery price if provided
      shippingCost = dto.deliveryPrice;
    } else if (dto.deliveryLocationId) {
      // Get the specific delivery location and use its price
      const locations = await this.deliveryService.getAllLocations();
      deliveryLocation = locations.find(loc => loc.id === dto.deliveryLocationId);
      
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
      const orderNumber = await this.orderIdService.generateOrderId('WEB');
      // Generate tracking number at order creation
      const trackingNumber = `TRK-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;
      
      const order = await tx.order.create({
        data: {
          orderNumber,
          trackingNumber,
          subtotal,
          discountAmount: dto.discountAmount || 0,
          promoCode: dto.promoCode,
          shippingCost,
          total,
          shippingAddress: JSON.stringify({
            fullName: dto.customerName.trim(),
            phone: dto.customerPhone.trim(),
            email: dto.customerEmail?.trim() || '',
            street: dto.deliveryLocation || '',
            town: dto.deliveryLocation || '',
            county: 'Kenya'
          }),
          deliveryLocation: dto.deliveryLocationId ? (deliveryLocation?.name || dto.deliveryLocation) : dto.deliveryLocation,
          deliveryPrice: shippingCost,
          paymentMethod: dto.paymentMethod,
          source: 'WEB_GUEST',
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

      // Record promo code usage if applicable
      if (dto.promoCode && dto.discountAmount) {
        await this.promoCodesService.recordOrderUsage(
          dto.promoCode,
          null, // Guest order
          order.id,
          dto.discountAmount,
          subtotal
        );
      }

      this.logger.log(`Guest order created: ${orderNumber} for ${dto.customerName} (${dto.customerPhone})`);
      return order;
    });
  }

  async create(userId: number, dto: CreateOrderDto) {
    // Get user profile data for customer information
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true, firstName: true, lastName: true }
    });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

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
    let deliveryLocation = null;
    
    if (dto.deliveryPrice !== undefined && dto.deliveryPrice >= 0) {
      // Use manual delivery price if provided
      shippingCost = dto.deliveryPrice;
    } else if (dto.deliveryLocationId) {
      // Get the specific delivery location and use its price
      const locations = await this.deliveryService.getAllLocations();
      deliveryLocation = locations.find(loc => loc.id === dto.deliveryLocationId);
      
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
      const orderNumber = await this.orderIdService.generateOrderId('WEB');
      // Generate tracking number at order creation
      const trackingNumber = `TRK-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;
      
      const order = await tx.order.create({
        data: {
          user: { connect: { id: userId } },
          orderNumber,
          trackingNumber,
          subtotal,
          discountAmount: dto.discountAmount || 0,
          promoCode: dto.promoCode,
          shippingCost,
          total,
          shippingAddress: JSON.stringify({
            fullName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer',
            phone: user.phone || '',
            email: user.email || '',
            street: dto.deliveryLocation || '',
            town: dto.deliveryLocation || '',
            county: 'Kenya'
          }),
          deliveryLocation: dto.deliveryLocationId ? (deliveryLocation?.name || dto.deliveryLocation) : dto.deliveryLocation,
          deliveryPrice: shippingCost,
          paymentMethod: dto.paymentMethod,
          source: 'WEB_USER',
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

      // DON'T clear cart immediately - let frontend handle it after order confirmation
      // Cart will be cleared by frontend after user sees order confirmation

      // Record promo code usage if applicable
      if (dto.promoCode && dto.discountAmount) {
        await this.promoCodesService.recordOrderUsage(
          dto.promoCode,
          userId,
          order.id,
          dto.discountAmount,
          subtotal
        );
      }

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

      // Generate tracking number if moving to SHIPPED and no tracking number exists
      let trackingNumber = dto.trackingNumber;
      if (dto.status === OrderStatus.SHIPPED && !order.trackingNumber && !trackingNumber) {
        trackingNumber = `TRK-${Date.now()}-${order.id}`;
        this.logger.debug(`Generated tracking number ${trackingNumber} for order ${id}`);
      }

      // Update order status first
      const updatedOrder = await this.prisma.order.update({
        where: { id },
        data: { 
          status: dto.status,
          ...(trackingNumber && { trackingNumber })
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

      // Emit real-time notification for order status update
      try {
        // Get status history for tracking updates
        const statusHistory = await this.prisma.orderStatusHistory.findMany({
          where: { orderId: id },
          orderBy: { createdAt: 'desc' },
          take: 10
        });

        await this.notificationsService.sendOrderUpdate({
          orderId: id,
          orderNumber: updatedOrder.orderNumber,
          status: dto.status,
          trackingNumber: updatedOrder.trackingNumber
        });

        // Also send detailed tracking update if tracking number exists
        if (updatedOrder.trackingNumber) {
          await this.notificationsService.sendTrackingUpdate({
            trackingNumber: updatedOrder.trackingNumber,
            status: dto.status,
            statusHistory: statusHistory.map(h => ({
              status: h.status,
              notes: h.notes,
              createdAt: h.createdAt
            }))
          });
        }
        
        this.logger.debug(`Real-time notification sent for order ${id}`);
      } catch (notificationError) {
        this.logger.error(`Error sending real-time notification for order ${id}:`, notificationError.message);
      }

      // Handle delivered status updates asynchronously
      if (dto.status === 'DELIVERED') {
        // Run these in background without blocking the response (only for authenticated users)
        if (updatedOrder.userId) {
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

  async getOrderTracking(orderIdentifier: string) {
    // Try to find by orderNumber first, then by ID if it's numeric
    let order = await this.prisma.order.findUnique({
      where: { orderNumber: orderIdentifier },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        total: true,
        paymentMethod: true,
        deliveryLocation: true,
        trackingNumber: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true
              }
            },
            variant: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // If not found by orderNumber and identifier is numeric, try by ID
    if (!order && /^\d+$/.test(orderIdentifier)) {
      order = await this.prisma.order.findUnique({
        where: { id: parseInt(orderIdentifier) },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          total: true,
          paymentMethod: true,
          deliveryLocation: true,
          trackingNumber: true,
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  images: true
                }
              },
              variant: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });
    }

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

  async getGuestOrder(orderNumber: string, phone: string) {
    // Clean phone number for comparison
    const cleanPhone = phone.replace(/\D/g, '');
    
    const order = await this.prisma.order.findFirst({
      where: {
        orderNumber,
        // For guest orders, check if userId is null or if shippingAddress contains the phone
        OR: [
          { userId: null },
          { userId: { equals: null } }
        ]
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
                price: true
              }
            },
            variant: {
              select: {
                name: true,
                sku: true
              }
            }
          }
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Verify phone number from shipping address
    let shippingAddress: any = {};
    try {
      shippingAddress = typeof order.shippingAddress === 'string' 
        ? JSON.parse(order.shippingAddress) 
        : order.shippingAddress || {};
    } catch (error) {
      this.logger.warn('Could not parse shipping address');
    }

    const orderPhone = (shippingAddress.phone || '').replace(/\D/g, '');
    
    // Check if the provided phone matches the order phone
    if (!orderPhone || !cleanPhone.includes(orderPhone.slice(-9)) && !orderPhone.includes(cleanPhone.slice(-9))) {
      throw new BadRequestException('Phone number does not match order records');
    }

    // Return order details without sensitive information
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      trackingNumber: order.trackingNumber,
      status: order.status,
      total: order.total,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      deliveryLocation: order.deliveryLocation,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items,
      customerInfo: {
        name: shippingAddress.fullName || 'Guest Customer',
        phone: shippingAddress.phone || '',
        email: shippingAddress.email || ''
      },
      statusHistory: order.statusHistory
    };
  }

  async getOrderStats() {
    try {
      const [totalOrders, totalRevenue, deliveredRevenue, statusCounts] = await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.aggregate({
          _sum: { total: true },
          where: { status: { not: 'CANCELLED' } }
        }),
        this.prisma.order.aggregate({
          _sum: { total: true },
          where: { status: 'DELIVERED' }
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
      const confirmedOrders = statusMap.get('CONFIRMED') || 0;

      const [recentOrders, urgentOrders] = await Promise.all([
        this.prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } }
          }
        }),
        this.prisma.order.findMany({
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
            createdAt: { lt: new Date(Date.now() - this.URGENT_ORDER_HOURS) }
          },
          include: {
            user: { select: { name: true, email: true } }
          },
          orderBy: { createdAt: 'asc' },
          take: 5
        })
      ]);

      return {
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.total) || 0,
        deliveredRevenue: Number(deliveredRevenue._sum.total) || 0,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        processingOrders,
        shippedOrders,
        recentOrders,
        urgentOrders
      };
    } catch (error) {
      this.logger.error('Error fetching order stats:', error.message, error.stack);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        deliveredRevenue: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        deliveredOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        recentOrders: [],
        urgentOrders: []
      };
    }
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