import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderWithPaymentDto } from './dto/create-order-with-payment.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ReturnRequestDto } from './dto/return-request.dto';
import { GuestCheckoutDto } from './dto/guest-checkout.dto';
import { MpesaService } from '../payments/mpesa.service';
import { DeliveryService } from '../delivery/delivery.service';
import { TrackingService } from '../delivery/tracking.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { AbandonedCartService } from '../whatsapp/abandoned-cart.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mpesaService: MpesaService,
    private deliveryService: DeliveryService,
    private trackingService: TrackingService,
    private whatsappService: WhatsAppService,
    private abandonedCartService: AbandonedCartService
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    const { items, shippingAddress, deliveryLocation, paymentMethod } = createOrderDto;
    
    // Calculate delivery price based on location
    const deliveryPrice = await this.deliveryService.calculateDeliveryPrice(deliveryLocation);

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true }
      });

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      let price = product.price;
      let availableStock = product.stock;

      if (item.variantId) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (!variant) {
          throw new NotFoundException(`Variant ${item.variantId} not found`);
        }
        price = variant.price;
        availableStock = variant.stock;
      }

      if (item.quantity > availableStock) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
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

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        userId,
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

    // Update stock
    for (const item of items) {
      if (item.variantId) {
        await this.prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } }
        });
      } else {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
    }

    // Clear cart items that were ordered
    for (const item of items) {
      await this.prisma.cart.deleteMany({
        where: {
          userId,
          productId: item.productId,
          variantId: item.variantId || null
        }
      });
    }

    // Create delivery tracking
    await this.trackingService.createTracking(order.id);

    // Send WhatsApp order confirmation
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.phone) {
      await this.whatsappService.sendOrderConfirmation(
        user.phone,
        order.orderNumber,
        order.total,
        order.id,
        userId
      );
    }

    // Mark abandoned cart as recovered
    await this.abandonedCartService.markCartAsRecovered(userId);

    return order;
  }

  async createOrderWithMpesaPayment(userId: string, createOrderDto: CreateOrderWithPaymentDto) {
    const order = await this.createOrder(userId, createOrderDto);
    
    if (createOrderDto.paymentMethod === 'MPESA') {
      const stkResponse = await this.mpesaService.initiateSTKPush(
        createOrderDto.phoneNumber,
        order.total,
        order.id
      );
      
      return {
        order,
        payment: stkResponse
      };
    }
    
    return { order };
  }

  async createOrderFromCart(userId: string, orderData: Omit<CreateOrderDto, 'items'>) {
    const cart = await this.prisma.cart.findMany({
      where: { userId },
      include: {
        product: true,
        variant: true
      }
    });

    if (cart.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const items = cart.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity
    }));

    return this.createOrder(userId, { ...orderData, items });
  }

  async getOrders(userId: string, page = 1, limit = 10) {
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

  async getOrderById(userId: string, orderId: string) {
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
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, updateStatusDto: UpdateOrderStatusDto) {
    const { status, notes } = updateStatusDto;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Update order status
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

    // Add status history
    await this.prisma.orderStatusHistory.create({
      data: {
        orderId,
        status,
        notes
      }
    });

    // Send WhatsApp delivery update
    const user = order.userId ? await this.prisma.user.findUnique({ where: { id: order.userId } }) : null;
    const phoneNumber = user?.phone || order.guestPhone;
    
    if (phoneNumber && ['CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
      await this.whatsappService.sendDeliveryUpdate(
        phoneNumber,
        order.orderNumber,
        status,
        notes,
        orderId,
        order.userId
      );
    }

    return updatedOrder;
  }

  async createReturnRequest(userId: string, orderId: string, returnRequestDto: ReturnRequestDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!['DELIVERED'].includes(order.status)) {
      throw new BadRequestException('Returns can only be requested for delivered orders');
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

  async getReturnRequests(userId: string) {
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

  async updateReturnRequestStatus(returnRequestId: string, status: string, notes?: string) {
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

  async getOrderTracking(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      statusHistory: order.statusHistory
    };
  }

  async createGuestOrder(guestCheckoutDto: GuestCheckoutDto) {
    const { items, email, firstName, lastName, phone, shippingAddress, deliveryLocation, paymentMethod, promoCode, phoneNumber } = guestCheckoutDto;
    
    // Calculate delivery price
    const deliveryPrice = await this.deliveryService.calculateDeliveryPrice(deliveryLocation);

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true }
      });

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      let price = product.price;
      let availableStock = product.stock;

      if (item.variantId) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (!variant) {
          throw new NotFoundException(`Variant ${item.variantId} not found`);
        }
        price = variant.price;
        availableStock = variant.stock;
      }

      if (item.quantity > availableStock) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
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

    // Apply promo code if provided
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
          } else {
            discount = promo.discountValue;
          }
          promoCodeId = promo.id;
        }
      }
    }

    const total = subtotal + deliveryPrice - discount;
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create guest order
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

    // Update stock
    for (const item of items) {
      if (item.variantId) {
        await this.prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } }
        });
      } else {
        await this.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
    }

    // Update promo code usage
    if (promoCodeId) {
      await this.prisma.promoCode.update({
        where: { id: promoCodeId },
        data: { usedCount: { increment: 1 } }
      });
    }

    // Create delivery tracking
    await this.trackingService.createTracking(order.id);

    // Send WhatsApp order confirmation for guest
    if (phone) {
      await this.whatsappService.sendOrderConfirmation(
        phone,
        order.orderNumber,
        order.total,
        order.id
      );
    }

    // Mark abandoned cart as recovered for guest
    await this.abandonedCartService.markCartAsRecovered(undefined, undefined, phone);

    // Handle M-Pesa payment if selected
    if (paymentMethod === 'MPESA' && phoneNumber) {
      const stkResponse = await this.mpesaService.initiateSTKPush(
        phoneNumber,
        order.total,
        order.id
      );
      
      return {
        order,
        payment: stkResponse
      };
    }

    return { order };
  }

  async getGuestOrderByNumber(orderNumber: string, email: string) {
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
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}