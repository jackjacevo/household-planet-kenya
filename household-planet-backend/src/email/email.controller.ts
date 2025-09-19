import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('welcome/:userId')
  async sendWelcome(@Param('userId') userId: string) {
    await this.emailService.sendWelcomeEmail(+userId);
    return { message: 'Welcome email sent' };
  }

  @Post('abandoned-cart/:userId')
  async sendAbandonedCart(@Param('userId') userId: string) {
    await this.emailService.sendAbandonedCartEmail(+userId);
    return { message: 'Abandoned cart email sent' };
  }

  @Post('order-confirmation/:orderId')
  async sendOrderConfirmation(@Param('orderId') orderId: string) {
    await this.emailService.sendOrderConfirmation(+orderId);
    return { message: 'Order confirmation sent' };
  }

  @Post('shipping/:orderId')
  async sendShipping(@Param('orderId') orderId: string) {
    await this.emailService.sendShippingNotification(+orderId);
    return { message: 'Shipping notification sent' };
  }

  @Post('delivery/:orderId')
  async sendDelivery(@Param('orderId') orderId: string) {
    await this.emailService.sendDeliveryConfirmation(+orderId);
    return { message: 'Delivery confirmation sent' };
  }

  @Post('birthday/:userId')
  async sendBirthday(@Param('userId') userId: string) {
    await this.emailService.sendBirthdayOffer(+userId);
    return { message: 'Birthday offer sent' };
  }

  @Post('newsletter')
  async sendNewsletter(@Body() body: { userIds: number[] }) {
    await this.emailService.sendNewsletter(body.userIds);
    return { message: 'Newsletter sent' };
  }

  @Post('reactivation/:userId')
  async sendReactivation(@Param('userId') userId: string) {
    await this.emailService.sendReactivationEmail(+userId);
    return { message: 'Reactivation email sent' };
  }

  @Post('templates')
  async createTemplate(@Body() body: any) {
    return this.emailService.createTemplate(body.name, body.subject, body.htmlContent, body.variables);
  }

  @Put('templates/:name')
  async updateTemplate(@Param('name') name: string, @Body() body: any) {
    return this.emailService.updateTemplate(name, body);
  }
}
