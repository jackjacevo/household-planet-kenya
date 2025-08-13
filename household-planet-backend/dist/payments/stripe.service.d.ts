import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
export declare class StripeService {
    private prisma;
    private stripe;
    constructor(prisma: PrismaService);
    createPaymentIntent(amount: number, orderId: string): Promise<{
        clientSecret: string;
        paymentIntentId: string;
    }>;
    confirmPayment(paymentIntentId: string): Promise<{
        status: Stripe.PaymentIntent.Status;
    }>;
}
