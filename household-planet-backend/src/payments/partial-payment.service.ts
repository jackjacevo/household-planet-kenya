import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartialPaymentService {
  constructor(private prisma: PrismaService) {}

  async createPartialPaymentPlan(orderId: string, installments: number) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');

    const installmentAmount = Math.ceil(order.total / installments);
    const plan = [];

    for (let i = 0; i < installments; i++) {
      const amount = i === installments - 1 
        ? order.total - (installmentAmount * (installments - 1))
        : installmentAmount;
      
      plan.push({
        orderId,
        installmentNumber: i + 1,
        amount,
        dueDate: new Date(Date.now() + (i * 30 * 24 * 60 * 60 * 1000)), // 30 days apart
        status: i === 0 ? 'DUE' : 'PENDING'
      });
    }

    await this.prisma.partialPayment.createMany({ data: plan });
    return { message: 'Payment plan created', installments: plan.length };
  }

  async processPartialPayment(installmentId: string, paymentData: any) {
    const installment = await this.prisma.partialPayment.findUnique({
      where: { id: installmentId },
      include: { order: true }
    });

    if (!installment || installment.status !== 'DUE') {
      throw new BadRequestException('Invalid installment');
    }

    await this.prisma.payment.create({
      data: {
        orderId: installment.orderId,
        checkoutRequestId: `PARTIAL-${installmentId}-${Date.now()}`,
        amount: installment.amount,
        phoneNumber: paymentData.phoneNumber || '',
        status: 'COMPLETED',
        paymentMethod: paymentData.method
      }
    });

    await this.prisma.partialPayment.update({
      where: { id: installmentId },
      data: { status: 'PAID', paidAt: new Date() }
    });

    // Check if all installments are paid
    const remainingInstallments = await this.prisma.partialPayment.count({
      where: { orderId: installment.orderId, status: { not: 'PAID' } }
    });

    if (remainingInstallments === 0) {
      await this.prisma.order.update({
        where: { id: installment.orderId },
        data: { paymentStatus: 'PAID' }
      });
    }

    // Mark next installment as due
    await this.prisma.partialPayment.updateMany({
      where: {
        orderId: installment.orderId,
        installmentNumber: installment.installmentNumber + 1
      },
      data: { status: 'DUE' }
    });

    return { message: 'Partial payment processed' };
  }

  async getPaymentPlan(orderId: string) {
    return this.prisma.partialPayment.findMany({
      where: { orderId },
      orderBy: { installmentNumber: 'asc' }
    });
  }
}