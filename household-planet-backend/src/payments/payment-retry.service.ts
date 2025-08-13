import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MpesaService } from './mpesa.service';
import { StripeService } from './stripe.service';

@Injectable()
export class PaymentRetryService {
  constructor(
    private prisma: PrismaService,
    private mpesaService: MpesaService,
    private stripeService: StripeService
  ) {}

  async retryFailedPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    });

    if (!payment || payment.status !== 'FAILED') return;

    const retryCount = await this.prisma.paymentRetry.count({
      where: { paymentId }
    });

    if (retryCount >= 3) {
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'RETRY_EXHAUSTED' }
      });
      return { message: 'Maximum retry attempts reached' };
    }

    await this.prisma.paymentRetry.create({
      data: { paymentId, attempt: retryCount + 1 }
    });

    try {
      let result;
      if (payment.paymentMethod === 'MPESA') {
        result = await this.mpesaService.initiateSTKPush(
          payment.phoneNumber,
          payment.amount,
          payment.orderId
        );
      } else if (payment.paymentMethod === 'STRIPE') {
        result = await this.stripeService.createPaymentIntent(
          payment.amount,
          payment.orderId
        );
      }

      await this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'PENDING' }
      });

      return { message: 'Payment retry initiated', result };
    } catch (error) {
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'FAILED', failureReason: error.message }
      });
      throw error;
    }
  }

  async scheduleAutoRetry(paymentId: string) {
    setTimeout(() => this.retryFailedPayment(paymentId), 300000); // 5 minutes
  }
}