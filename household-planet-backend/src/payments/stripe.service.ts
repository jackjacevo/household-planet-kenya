import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    });
  }

  async createPaymentIntent(amount: number, orderId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'kes',
        metadata: { orderId }
      });

      await this.prisma.payment.create({
        data: {
          orderId,
          checkoutRequestId: paymentIntent.id,
          amount,
          phoneNumber: '',
          status: 'PENDING',
          paymentMethod: 'STRIPE'
        }
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async confirmPayment(paymentIntentId: string) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    
    const payment = await this.prisma.payment.findFirst({
      where: { checkoutRequestId: paymentIntentId }
    });

    if (payment && paymentIntent.status === 'succeeded') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED', mpesaReceiptNumber: paymentIntent.id }
      });

      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' }
      });
    }

    return { status: paymentIntent.status };
  }
}