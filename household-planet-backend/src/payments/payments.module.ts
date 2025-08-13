import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { MpesaService } from './mpesa.service';
import { StripeService } from './stripe.service';
import { FlutterwaveService } from './flutterwave.service';
import { PaymentManagementService } from './payment-management.service';
import { PaymentRetryService } from './payment-retry.service';
import { PartialPaymentService } from './partial-payment.service';
import { PaymentAnalyticsService } from './payment-analytics.service';
import { InvoiceService } from './invoice.service';
import { NotificationService } from './notification.service';
import { PaymentSecurityService } from './payment-security.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [
    MpesaService, 
    StripeService, 
    FlutterwaveService, 
    PaymentManagementService,
    PaymentRetryService,
    PartialPaymentService,
    PaymentAnalyticsService,
    InvoiceService,
    NotificationService,
    PaymentSecurityService
  ],
  exports: [
    MpesaService, 
    StripeService, 
    FlutterwaveService, 
    PaymentManagementService,
    PaymentRetryService,
    PartialPaymentService,
    PaymentAnalyticsService,
    InvoiceService,
    NotificationService,
    PaymentSecurityService
  ],
})
export class PaymentsModule {}