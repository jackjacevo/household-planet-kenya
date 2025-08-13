import { PrismaService } from '../prisma/prisma.service';
import { MpesaService } from './mpesa.service';
import { StripeService } from './stripe.service';
export declare class PaymentRetryService {
    private prisma;
    private mpesaService;
    private stripeService;
    constructor(prisma: PrismaService, mpesaService: MpesaService, stripeService: StripeService);
    retryFailedPayment(paymentId: string): Promise<{
        message: string;
        result?: undefined;
    } | {
        message: string;
        result: any;
    }>;
    scheduleAutoRetry(paymentId: string): Promise<void>;
}
