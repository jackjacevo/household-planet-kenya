import { Controller, Post, Get, Body, UseGuards, Request, Ip, Param, Query, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { MpesaService } from './mpesa.service';
import { TokenizationService } from './tokenization.service';
import { ComplianceService } from './compliance.service';
import { CreatePaymentIntentDto, ProcessPaymentDto, MpesaPaymentDto } from './dto/payment.dto';
import { PaymentFilterDto, RefundDto } from './dto/admin-payment.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums';

@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private mpesaService: MpesaService,
    private tokenizationService: TokenizationService,
    private complianceService: ComplianceService,
  ) {}

  @Post('initiate')
  @UseGuards(AuthGuard('jwt'))
  async initiatePayment(@Request() req, @Body() body: { orderId: number; paymentMethod: string; phoneNumber: string }) {
    try {
      console.log('Payment initiation request:', { orderId: body.orderId, paymentMethod: body.paymentMethod, phoneNumber: body.phoneNumber });
      
      // Validate required fields
      if (!body.orderId || !body.paymentMethod || !body.phoneNumber) {
        throw new BadRequestException('Missing required fields: orderId, paymentMethod, phoneNumber');
      }
      
      if (body.paymentMethod === 'MPESA') {
        const order = await this.paymentsService.getOrder(body.orderId);
        console.log('Retrieved order:', order);
        
        if (!order) {
          console.error(`Order not found: ${body.orderId}`);
          throw new BadRequestException('Order not found');
        }
        if (!order.total || order.total <= 0) {
          console.error(`Order total is invalid: ${order.total}`);
          throw new BadRequestException('Order total is invalid');
        }
        
        // Normalize phone number to +254XXXXXXXXX format
        let phoneNumber = body.phoneNumber.replace(/[\s\-]/g, '');
        if (phoneNumber.startsWith('07')) {
          phoneNumber = '+254' + phoneNumber.substring(1);
        } else if (phoneNumber.startsWith('7')) {
          phoneNumber = '+254' + phoneNumber;
        } else if (phoneNumber.startsWith('254')) {
          phoneNumber = '+' + phoneNumber;
        } else if (!phoneNumber.startsWith('+254')) {
          throw new BadRequestException('Invalid phone number format. Use format: +254XXXXXXXXX, 254XXXXXXXXX, 07XXXXXXXX, or 7XXXXXXXX');
        }
        
        // Validate normalized phone number
        if (!/^\+254[17]\d{8}$/.test(phoneNumber)) {
          throw new BadRequestException('Invalid Kenyan phone number. Must be a valid Safaricom or Airtel number.');
        }
        
        console.log(`Initiating M-Pesa payment for order ${body.orderId} with amount ${order.total}`);
        return this.mpesaService.initiateSTKPush(phoneNumber, parseFloat(order.total.toString()), body.orderId);
      }
      throw new BadRequestException('Payment method not supported');
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw error;
    }
  }

  @Get('status/:orderId')
  @UseGuards(AuthGuard('jwt'))
  async getPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentStatus(parseInt(orderId));
  }

  @Post('retry/:orderId')
  @UseGuards(AuthGuard('jwt'))
  async retryPayment(@Param('orderId') orderId: string) {
    return this.paymentsService.retryPayment(parseInt(orderId));
  }

  @Post('partial')
  @UseGuards(AuthGuard('jwt'))
  async processPartialPayment(@Request() req, @Body() body: { orderId: number; amount: number; phoneNumber: string }) {
    return this.paymentsService.processPartialPayment(body.orderId, body.amount, body.phoneNumber, req.user.id);
  }

  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  async getPaymentHistory(@Request() req) {
    return this.paymentsService.getPaymentHistory(req.user.id);
  }

  @Post('mpesa/callback')
  async handleMpesaCallback(@Body() callbackData: any) {
    return this.mpesaService.handleCallback(callbackData);
  }

  @Post('mpesa/c2b/confirmation')
  async handleC2BConfirmation(@Body() callbackData: any) {
    return this.mpesaService.handleC2BCallback(callbackData);
  }

  @Post('mpesa/c2b/validation')
  async handleC2BValidation(@Body() callbackData: any) {
    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }

  // Admin endpoints
  @Get('admin/stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async getPaymentStats() {
    return this.paymentsService.getPaymentStats();
  }

  @Get('admin/transactions')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async getTransactions(@Query() filters: PaymentFilterDto) {
    return this.paymentsService.getTransactions(filters);
  }

  @Post('admin/refund')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async processRefund(@Body() refundDto: RefundDto) {
    return this.paymentsService.processRefund(refundDto);
  }

  @Get('admin/analytics')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async getPaymentAnalytics(@Query('period') period: string = 'monthly') {
    return this.paymentsService.getPaymentAnalytics(period);
  }

  @Post('admin/invoice/:orderId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async generateInvoice(@Param('orderId') orderId: string) {
    return this.paymentsService.generateInvoice(parseInt(orderId));
  }

  @Post('admin/cash-payment')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async recordCashPayment(@Body() body: { orderId: number | string; amount: number; receivedBy: string; notes?: string }) {
    return this.paymentsService.recordCashPayment(body.orderId, body.amount, body.receivedBy, body.notes);
  }

  @Post('admin/paybill-payment')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async recordPaybillPayment(@Body() body: { phoneNumber: string; amount: number; mpesaCode: string; reference?: string; notes?: string; orderId?: number | string }) {
    return this.paymentsService.recordPaybillPayment(body.phoneNumber, body.amount, body.mpesaCode, body.reference, body.notes, body.orderId);
  }

  @Post('admin/pending-payment')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async createPendingPayment(@Body() body: { orderId: number | string; amount: number; phoneNumber: string; notes?: string }) {
    return this.paymentsService.createPendingPayment(body.orderId, body.amount, body.phoneNumber, body.notes);
  }

  @Post('admin/stk-push')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async adminSTKPush(@Body() body: { orderId: number; phoneNumber: string; amount?: number }) {
    const order = await this.paymentsService.getOrder(body.orderId);
    const amount = body.amount || parseFloat(order.total.toString());
    return this.mpesaService.initiateSTKPush(body.phoneNumber, amount, body.orderId);
  }

  @Get('receipt/:orderId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async generateReceipt(@Param('orderId') orderId: string) {
    return this.paymentsService.generateReceipt(parseInt(orderId));
  }
}
