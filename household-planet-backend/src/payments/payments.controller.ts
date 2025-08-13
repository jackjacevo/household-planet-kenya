import { Controller, Post, Body, Get, Param, UseGuards, Put } from '@nestjs/common';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums';

@Controller('payments')
export class PaymentsController {
  constructor(
    private mpesaService: MpesaService,
    private stripeService: StripeService,
    private flutterwaveService: FlutterwaveService,
    private paymentManagementService: PaymentManagementService,
    private paymentRetryService: PaymentRetryService,
    private partialPaymentService: PartialPaymentService,
    private paymentAnalyticsService: PaymentAnalyticsService,
    private invoiceService: InvoiceService,
    private notificationService: NotificationService,
    private paymentSecurityService: PaymentSecurityService
  ) {}

  @Post('mpesa/initiate')
  @UseGuards(JwtAuthGuard)
  async initiatePayment(
    @Body() body: { phoneNumber: string; amount: number; orderId: string },
    @CurrentUser() user: any
  ) {
    return this.mpesaService.initiateSTKPush(body.phoneNumber, body.amount, body.orderId);
  }

  @Post('mpesa/callback')
  async mpesaCallback(@Body() callbackData: any) {
    await this.mpesaService.handleCallback(callbackData);
    return { ResultCode: 0, ResultDesc: 'Success' };
  }

  @Get('status/:checkoutRequestId')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(@Param('checkoutRequestId') checkoutRequestId: string) {
    return this.mpesaService.checkPaymentStatus(checkoutRequestId);
  }

  @Post('stripe/create-intent')
  @UseGuards(JwtAuthGuard)
  async createStripePayment(@Body() body: { amount: number; orderId: string }) {
    return this.stripeService.createPaymentIntent(body.amount, body.orderId);
  }

  @Post('stripe/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmStripePayment(@Body() body: { paymentIntentId: string }) {
    return this.stripeService.confirmPayment(body.paymentIntentId);
  }

  @Post('flutterwave/initiate')
  @UseGuards(JwtAuthGuard)
  async initiateFlutterwavePayment(
    @Body() body: { amount: number; email: string; phoneNumber: string; orderId: string }
  ) {
    return this.flutterwaveService.initiatePayment(body.amount, body.email, body.phoneNumber, body.orderId);
  }

  @Post('flutterwave/verify')
  @UseGuards(JwtAuthGuard)
  async verifyFlutterwavePayment(@Body() body: { txRef: string }) {
    return this.flutterwaveService.verifyPayment(body.txRef);
  }

  @Post('cod/:orderId')
  @UseGuards(JwtAuthGuard)
  async processCOD(@Param('orderId') orderId: string) {
    return this.paymentManagementService.processCashOnDelivery(orderId);
  }

  @Put('cod/:orderId/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async confirmCOD(@Param('orderId') orderId: string) {
    return this.paymentManagementService.confirmCODPayment(orderId);
  }

  @Post('bank-transfer/:orderId')
  @UseGuards(JwtAuthGuard)
  async processBankTransfer(@Param('orderId') orderId: string, @Body() bankDetails: any) {
    return this.paymentManagementService.processBankTransfer(orderId, bankDetails);
  }

  @Put('bank-transfer/:orderId/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async verifyBankTransfer(@Param('orderId') orderId: string, @Body() body: { referenceNumber: string }) {
    return this.paymentManagementService.verifyBankTransfer(orderId, body.referenceNumber);
  }

  @Post('refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async processRefund(@Body() body: { paymentId: string; amount: number; reason: string }) {
    return this.paymentManagementService.processRefund(body.paymentId, body.amount, body.reason);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPaymentDashboard() {
    return this.paymentManagementService.getPaymentDashboard();
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getTransactionHistory(@Body() query: { page?: number; limit?: number }) {
    return this.paymentManagementService.getTransactionHistory(query.page, query.limit);
  }

  @Post('retry/:paymentId')
  @UseGuards(JwtAuthGuard)
  async retryPayment(@Param('paymentId') paymentId: string) {
    return this.paymentRetryService.retryFailedPayment(paymentId);
  }

  @Post('partial/:orderId')
  @UseGuards(JwtAuthGuard)
  async createPartialPaymentPlan(@Param('orderId') orderId: string, @Body() body: { installments: number }) {
    return this.partialPaymentService.createPartialPaymentPlan(orderId, body.installments);
  }

  @Post('partial/pay/:installmentId')
  @UseGuards(JwtAuthGuard)
  async payInstallment(@Param('installmentId') installmentId: string, @Body() paymentData: any) {
    return this.partialPaymentService.processPartialPayment(installmentId, paymentData);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPaymentAnalytics(@Body() query: { startDate: string; endDate: string }) {
    return this.paymentAnalyticsService.getPaymentAnalytics(new Date(query.startDate), new Date(query.endDate));
  }

  @Post('invoice/:orderId')
  @UseGuards(JwtAuthGuard)
  async generateInvoice(@Param('orderId') orderId: string) {
    const path = await this.invoiceService.generateInvoice(orderId);
    return { message: 'Invoice generated', path };
  }

  @Post('notify/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async sendPaymentNotification(@Param('orderId') orderId: string) {
    await this.notificationService.sendPaymentConfirmationEmail(orderId);
    await this.notificationService.sendPaymentConfirmationSMS(orderId);
    return { message: 'Notifications sent' };
  }

  @Post('secure-session')
  @UseGuards(JwtAuthGuard)
  async createSecureSession(@Body() body: { orderId: string; paymentMethod: string }) {
    return this.paymentSecurityService.createSecurePaymentSession(body.orderId, body.paymentMethod);
  }
}