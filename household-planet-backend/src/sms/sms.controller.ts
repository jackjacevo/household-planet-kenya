import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SmsService } from './sms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('sms')
export class SmsController {
  constructor(private smsService: SmsService) {}

  @Public()
  @Post('send-otp')
  async sendOtp(@Body() body: { phoneNumber: string }) {
    const otp = await this.smsService.generateOtp();
    const success = await this.smsService.sendOtp(body.phoneNumber, otp);
    return { success };
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() body: { phoneNumber: string; code: string }) {
    const isValid = await this.smsService.verifyOtp(body.phoneNumber, body.code);
    return { isValid };
  }

  @Post('send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async sendSms(@Body() body: {
    phoneNumber: string;
    message: string;
    type?: string;
  }) {
    const success = await this.smsService.sendSms(
      body.phoneNumber,
      body.message,
      body.type || 'MANUAL'
    );
    return { success };
  }

  @Post('promotional')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async sendPromotional(@Body() body: {
    phoneNumbers: string[];
    message: string;
  }) {
    return this.smsService.sendPromotionalSms(body.phoneNumbers, body.message);
  }

  @Post('order-confirmation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async sendOrderConfirmation(@Body() body: {
    phoneNumber: string;
    orderNumber: string;
    total: number;
  }) {
    const success = await this.smsService.sendOrderConfirmation(
      body.phoneNumber,
      body.orderNumber,
      body.total
    );
    return { success };
  }

  @Post('payment-confirmation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async sendPaymentConfirmation(@Body() body: {
    phoneNumber: string;
    orderNumber: string;
    amount: number;
    method: string;
  }) {
    const success = await this.smsService.sendPaymentConfirmation(
      body.phoneNumber,
      body.orderNumber,
      body.amount,
      body.method
    );
    return { success };
  }

  @Post('shipping-notification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async sendShippingNotification(@Body() body: {
    phoneNumber: string;
    orderNumber: string;
    trackingNumber?: string;
  }) {
    const success = await this.smsService.sendShippingNotification(
      body.phoneNumber,
      body.orderNumber,
      body.trackingNumber
    );
    return { success };
  }

  @Post('delivery-notification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async sendDeliveryNotification(@Body() body: {
    phoneNumber: string;
    orderNumber: string;
    deliveryTime?: string;
  }) {
    const success = await this.smsService.sendDeliveryNotification(
      body.phoneNumber,
      body.orderNumber,
      body.deliveryTime
    );
    return { success };
  }

  @Post('wishlist-alert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async sendWishlistAlert(@Body() body: {
    phoneNumber: string;
    productName: string;
  }) {
    const success = await this.smsService.sendWishlistAlert(
      body.phoneNumber,
      body.productName
    );
    return { success };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getSmsStats() {
    return this.smsService.getSmsStats();
  }
}