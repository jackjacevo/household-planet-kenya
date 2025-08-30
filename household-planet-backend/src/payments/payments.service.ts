import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenizationService } from './tokenization.service';
import { ComplianceService } from './compliance.service';
import { CreatePaymentIntentDto, ProcessPaymentDto, MpesaPaymentDto } from './dto/payment.dto';
import { PaymentTransactionStatus, OrderStatus, PaymentStatus } from '../common/enums';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private tokenizationService: TokenizationService,
    private complianceService: ComplianceService,
  ) {}

  /**
   * Extracts numeric amount from payment ID or returns the amount if it's already numeric
   * Payment ID format: WA-1756163997824-4200 (last 4 digits represent amount in cents)
   */
  private extractAmount(amountOrId: number | string): number {
    if (typeof amountOrId === 'number') {
      return amountOrId;
    }
    
    // Extract amount from payment ID (last 4 digits represent amount in cents)
    const match = amountOrId.match(/^[A-Z]{2}-(\d{13})-(\d{4})$/);
    if (match) {
      const amountInCents = parseInt(match[2], 10);
      return amountInCents / 100; // Convert cents to actual amount
    }
    
    throw new BadRequestException(`Invalid payment amount or ID format: ${amountOrId}`);
  }

  /**
   * Checks if the input is a payment ID
   */
  private isPaymentId(value: number | string): boolean {
    return typeof value === 'string' && /^[A-Z]{2}-\d{13}-\d{4}$/.test(value);
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto, userId: string, ipAddress: string) {
    const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const actualAmount = this.extractAmount(dto.amount);
    
    this.complianceService.logPaymentEvent('payment_intent_created', {
      paymentIntentId,
      originalAmount: dto.amount,
      actualAmount,
      currency: dto.currency,
      paymentMethod: dto.paymentMethod,
      isPaymentId: this.isPaymentId(dto.amount),
    }, userId, ipAddress);

    return {
      paymentIntentId,
      amount: actualAmount,
      originalAmount: dto.amount,
      currency: dto.currency,
      status: 'requires_payment_method',
      clientSecret: `${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 16)}`,
    };
  }

  async processPayment(dto: ProcessPaymentDto, userId: string, ipAddress: string) {
    try {
      // Validate payment token (never handle raw card data)
      if (!this.tokenizationService.validateToken(dto.paymentToken)) {
        this.complianceService.logPaymentEvent('token_validation_failed', {
          paymentIntentId: dto.paymentIntentId,
        }, userId, ipAddress);
        throw new BadRequestException('Invalid payment token');
      }

      // Get tokenized data (only masked information)
      const tokenData = this.tokenizationService.getTokenData(dto.paymentToken);
      if (!tokenData) {
        this.complianceService.logPaymentEvent('token_expired', {
          paymentIntentId: dto.paymentIntentId,
        }, userId, ipAddress);
        throw new BadRequestException('Payment token expired');
      }

      // Process payment with external PCI DSS compliant processor
      const paymentResult = await this.processWithExternalProcessor(dto, tokenData);

      this.complianceService.logPaymentEvent('payment_processed', {
        paymentIntentId: dto.paymentIntentId,
        status: paymentResult.status,
        maskedCard: tokenData.maskedData,
      }, userId, ipAddress);

      return paymentResult;
    } catch (error) {
      this.complianceService.logPaymentEvent('payment_failure', {
        paymentIntentId: dto.paymentIntentId,
        error: error.message,
      }, userId, ipAddress);
      throw error;
    }
  }

  private async processWithExternalProcessor(dto: ProcessPaymentDto, tokenData: any) {
    // Simulate external PCI DSS compliant processor (Stripe, PayPal, etc.)
    // In production, this would call actual payment processor APIs
    
    return {
      id: `charge_${Date.now()}`,
      status: 'succeeded',
      amount: 1000, // Would come from payment intent
      currency: 'KES',
      paymentMethod: {
        type: 'card',
        card: {
          last4: tokenData.maskedData.slice(-4),
          brand: 'visa',
        },
      },
    };
  }

  async processMpesaPayment(dto: MpesaPaymentDto, userId: string, ipAddress: string) {
    const actualAmount = this.extractAmount(dto.amount);
    
    this.complianceService.logPaymentEvent('mpesa_payment_initiated', {
      phoneNumber: dto.phoneNumber.replace(/(\d{3})(\d{3})(\d{3})/, '$1***$3'),
      originalAmount: dto.amount,
      actualAmount,
      isPaymentId: this.isPaymentId(dto.amount),
    }, userId, ipAddress);

    // Integrate with Safaricom Daraja API
    return {
      checkoutRequestId: `ws_CO_${Date.now()}`,
      responseCode: '0',
      responseDescription: 'Success. Request accepted for processing',
      customerMessage: 'Success. Request accepted for processing',
      amount: actualAmount,
      originalAmount: dto.amount,
    };
  }

  async getOrder(orderId: number) {
    return this.prisma.order.findUnique({ where: { id: orderId } });
  }

  async getPaymentStatus(orderId: number) {
    return this.prisma.paymentTransaction.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPaymentHistory(userId: number) {
    return this.prisma.paymentTransaction.findMany({
      where: { order: { userId } },
      include: { order: { select: { orderNumber: true, total: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPaymentStats() {
    const [total, completed, failed, pending, refunded, revenue, paymentTypes] = await Promise.all([
      this.prisma.paymentTransaction.count(),
      this.prisma.paymentTransaction.count({ where: { status: PaymentTransactionStatus.COMPLETED } }),
      this.prisma.paymentTransaction.count({ where: { status: PaymentTransactionStatus.FAILED } }),
      this.prisma.paymentTransaction.count({ where: { status: PaymentTransactionStatus.PENDING } }),
      this.prisma.paymentTransaction.count({ where: { status: 'REFUNDED' as any } }),
      this.prisma.paymentTransaction.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' as any }
      }),
      this.prisma.paymentTransaction.groupBy({
        by: ['paymentType'],
        _count: { paymentType: true },
        _sum: { amount: true },
        where: { status: 'COMPLETED' as any }
      })
    ]);

    const paymentTypeStats = paymentTypes.reduce((acc, type) => {
      acc[type.paymentType] = {
        count: type._count.paymentType,
        amount: Number(type._sum.amount) || 0
      };
      return acc;
    }, {});

    return {
      totalTransactions: total,
      completedTransactions: completed,
      failedTransactions: failed,
      pendingTransactions: pending,
      refundedTransactions: refunded,
      totalRevenue: Number(revenue._sum.amount) || 0,
      successRate: total > 0 ? (completed / total) * 100 : 0,
      paymentTypeBreakdown: paymentTypeStats
    };
  }

  async getTransactions(filters: any) {
    const { status, provider, search, startDate, endDate, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (status) where.status = status;
    if (provider) where.provider = provider;
    // Temporarily disable search to prevent SQLite errors
    // if (search && search.trim()) {
    //   where.OR = [
    //     { phoneNumber: { contains: search } },
    //     { order: { orderNumber: { contains: search } } },
    //     { order: { user: { name: { contains: search } } } },
    //     { order: { user: { email: { contains: search } } } },
    //     { order: { user: { phone: { contains: search } } } }
    //   ];
    // }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    return this.prisma.paymentTransaction.findMany({
      where,
      include: {
        order: {
          select: {
            orderNumber: true,
            user: { select: { name: true, email: true, phone: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    });
  }

  async processRefund(refundDto: any) {
    const { transactionId, reason, amount } = refundDto;
    
    const transaction = await this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { order: true }
    });

    if (!transaction || transaction.status !== PaymentTransactionStatus.COMPLETED) {
      throw new Error('Transaction not eligible for refund');
    }

    const refundAmount = amount ? this.extractAmount(amount) : Number(transaction.amount);
    
    // Update transaction status
    await this.prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: { status: 'REFUNDED' as any }
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: transaction.orderId },
      data: { status: 'REFUNDED' as any, paymentStatus: 'REFUNDED' as any }
    });

    this.complianceService.logPaymentEvent('refund_processed', {
      transactionId,
      originalRefundAmount: amount,
      refundAmount,
      reason,
      isPaymentId: amount ? this.isPaymentId(amount) : false
    }, 'admin', 'system');

    return { 
      success: true, 
      refundAmount, 
      originalRefundAmount: amount,
      transactionId,
      isPaymentId: amount ? this.isPaymentId(amount) : false
    };
  }

  async getPaymentAnalytics(period: string) {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    }

    const transactions = await this.prisma.paymentTransaction.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, amount: true, status: true, provider: true }
    });

    const analytics = {
      totalVolume: transactions.reduce((sum, t) => sum + Number(t.amount), 0),
      transactionCount: transactions.length,
      averageAmount: transactions.length > 0 ? 
        transactions.reduce((sum, t) => sum + Number(t.amount), 0) / transactions.length : 0,
      byProvider: this.groupBy(transactions, 'provider'),
      byStatus: this.groupBy(transactions, 'status'),
      dailyTrends: this.getDailyTrends(transactions)
    };

    return analytics;
  }

  private groupBy(array: any[], key: string) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'Unknown';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  private getDailyTrends(transactions: any[]) {
    const trends = new Map();
    transactions.forEach(t => {
      const date = new Date(t.createdAt).toISOString().split('T')[0];
      const existing = trends.get(date) || { count: 0, amount: 0 };
      trends.set(date, {
        count: existing.count + 1,
        amount: existing.amount + Number(t.amount)
      });
    });
    return Array.from(trends.entries()).map(([date, data]) => ({ date, ...data }));
  }

  async retryPayment(orderId: number) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    const failedTransaction = await this.prisma.paymentTransaction.findFirst({
      where: { orderId, status: 'FAILED' as any },
      orderBy: { createdAt: 'desc' }
    });

    if (!failedTransaction) throw new Error('No failed transaction to retry');

    // Create new transaction for retry
    const retryTransaction = await this.prisma.paymentTransaction.create({
      data: {
        orderId,
        checkoutRequestId: `retry_${Date.now()}`,
        phoneNumber: failedTransaction.phoneNumber,
        amount: failedTransaction.amount,
        status: PaymentTransactionStatus.PENDING,
        provider: failedTransaction.provider
      }
    });

    return { success: true, transactionId: retryTransaction.id };
  }

  async processPartialPayment(orderIdOrNumber: number | string, amountOrId: number | string, phoneNumber: string, userId: number) {
    // Find order by ID or order number
    let order;
    if (typeof orderIdOrNumber === 'number') {
      order = await this.prisma.order.findUnique({ where: { id: orderIdOrNumber } });
    } else {
      order = await this.prisma.order.findUnique({ where: { orderNumber: orderIdOrNumber } });
    }
    
    if (!order) throw new Error('Order not found');

    const amount = this.extractAmount(amountOrId);

    const paidAmount = await this.prisma.paymentTransaction.aggregate({
      _sum: { amount: true },
      where: { orderId: order.id, status: 'COMPLETED' as any }
    });

    const totalPaid = Number(paidAmount._sum.amount) || 0;
    const remaining = Number(order.total) - totalPaid;

    if (amount > remaining) throw new Error('Amount exceeds remaining balance');

    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        checkoutRequestId: `partial_${Date.now()}`,
        phoneNumber,
        amount,
        status: PaymentTransactionStatus.PENDING,
        provider: 'MPESA'
      }
    });

    // Update order status if fully paid
    if (totalPaid + amount >= Number(order.total)) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'PAID' }
      });
    }

    return { 
      success: true, 
      transactionId: transaction.id, 
      remaining: remaining - amount,
      amount,
      originalAmount: amountOrId,
      isPaymentId: this.isPaymentId(amountOrId),
      orderNumber: order.orderNumber
    };
  }

  async recordCashPayment(orderIdOrNumber: number | string, amountOrId: number | string, receivedBy: string, notes?: string) {
    // Find order by ID or order number
    let order;
    if (typeof orderIdOrNumber === 'number') {
      order = await this.prisma.order.findUnique({ where: { id: orderIdOrNumber } });
    } else {
      order = await this.prisma.order.findUnique({ where: { orderNumber: orderIdOrNumber } });
    }
    
    if (!order) throw new Error('Order not found');

    const amount = this.extractAmount(amountOrId);

    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        checkoutRequestId: `cash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        phoneNumber: 'N/A',
        amount,
        status: 'COMPLETED',
        provider: 'CASH',
        paymentType: 'CASH',
        cashReceivedBy: receivedBy,
        notes: notes ? `${notes} | Original: ${amountOrId}` : `Original: ${amountOrId}`,
        transactionDate: new Date()
      }
    });

    // Update order payment status
    const totalPaid = await this.prisma.paymentTransaction.aggregate({
      _sum: { amount: true },
      where: { orderId: order.id, status: 'COMPLETED' }
    });

    if (Number(totalPaid._sum.amount) >= Number(order.total)) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' }
      });
    }

    return { 
      success: true, 
      transactionId: transaction.id,
      amount,
      originalAmount: amountOrId,
      isPaymentId: this.isPaymentId(amountOrId),
      orderNumber: order.orderNumber
    };
  }

  async recordPaybillPayment(phoneNumber: string, amountOrId: number | string, mpesaCode: string, reference?: string, notes?: string, orderIdOrNumber?: number | string) {
    const amount = this.extractAmount(amountOrId);
    
    // Find order if provided
    let order = null;
    if (orderIdOrNumber) {
      if (typeof orderIdOrNumber === 'number') {
        order = await this.prisma.order.findUnique({ where: { id: orderIdOrNumber } });
      } else {
        order = await this.prisma.order.findUnique({ where: { orderNumber: orderIdOrNumber } });
      }
    }
    
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        orderId: order?.id,
        checkoutRequestId: `paybill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        phoneNumber,
        amount,
        status: 'COMPLETED',
        provider: 'MPESA',
        paymentType: 'PAYBILL',
        mpesaReceiptNumber: mpesaCode,
        paybillReference: reference || 'HouseholdPlanet',
        notes: notes ? `${notes} | Original: ${amountOrId}` : `Original: ${amountOrId}`,
        transactionDate: new Date()
      }
    });

    // Update order payment status if order is linked
    if (order) {
      const totalPaid = await this.prisma.paymentTransaction.aggregate({
        _sum: { amount: true },
        where: { orderId: order.id, status: 'COMPLETED' }
      });

      if (Number(totalPaid._sum.amount) >= Number(order.total)) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'PAID', status: 'CONFIRMED' }
        });
      }
    }

    return { 
      success: true, 
      transactionId: transaction.id,
      amount,
      originalAmount: amountOrId,
      isPaymentId: this.isPaymentId(amountOrId),
      orderNumber: order?.orderNumber
    };
  }

  async createPendingPayment(orderIdOrNumber: number | string, amountOrId: number | string, phoneNumber: string, notes?: string) {
    // Find order by ID or order number
    let order;
    if (typeof orderIdOrNumber === 'number') {
      order = await this.prisma.order.findUnique({ where: { id: orderIdOrNumber } });
    } else {
      order = await this.prisma.order.findUnique({ where: { orderNumber: orderIdOrNumber } });
    }
    
    if (!order) throw new Error('Order not found');

    const amount = this.extractAmount(amountOrId);

    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        checkoutRequestId: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        phoneNumber,
        amount,
        status: 'PENDING',
        provider: 'PENDING',
        paymentType: 'PENDING',
        notes: notes ? `${notes} | Original: ${amountOrId}` : `Pending payment | Original: ${amountOrId}`,
        transactionDate: new Date()
      }
    });

    return { 
      success: true, 
      transactionId: transaction.id,
      amount,
      originalAmount: amountOrId,
      isPaymentId: this.isPaymentId(amountOrId),
      orderNumber: order.orderNumber
    };
  }

  async generateInvoice(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: { include: { product: true } },
        paymentTransactions: { where: { status: 'COMPLETED' as any } }
      }
    });

    if (!order) throw new Error('Order not found');

    const invoice = {
      invoiceNumber: `INV-${order.orderNumber}`,
      date: new Date().toISOString(),
      customer: {
        name: order.user.name,
        email: order.user.email
      },
      items: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.total)
      })),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shippingCost),
      total: Number(order.total),
      payments: order.paymentTransactions.map(t => ({
        date: t.createdAt,
        amount: Number(t.amount),
        method: `${t.provider} (${t.paymentType})`,
        reference: t.mpesaReceiptNumber || t.paybillReference || 'N/A',
        receivedBy: t.cashReceivedBy
      }))
    };

    return invoice;
  }
}