import { Controller, Post, Body, UseGuards, Get, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { PushService } from './push.service';

@Controller('push')
export class PushController {
  constructor(private pushService: PushService) {}

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribe(
    @CurrentUser() user: any,
    @Body() subscription: any
  ) {
    return this.pushService.subscribe(user.id, subscription);
  }

  @Post('unsubscribe')
  async unsubscribe(
    @Body() body: { endpoint: string }
  ) {
    return this.pushService.unsubscribe(body.endpoint);
  }

  @Post('test')
  @UseGuards(JwtAuthGuard)
  async testNotification(@CurrentUser() user: any) {
    return this.pushService.sendNotification(user.id, {
      title: '🧪 Test Notification',
      body: 'This is a test notification from Household Planet Kenya',
      url: '/',
      tag: 'test'
    });
  }

  @Post('broadcast')
  @UseGuards(JwtAuthGuard)
  async broadcastNotification(
    @CurrentUser() user: any,
    @Body() payload: {
      title: string;
      body: string;
      url?: string;
      userIds?: string[];
    }
  ) {
    // Only allow admin users to broadcast
    if (user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }
    
    return this.pushService.broadcastNotification(payload);
  }

  @Post('order-update')
  @UseGuards(JwtAuthGuard)
  async sendOrderUpdate(
    @CurrentUser() user: any,
    @Body() body: { userId: string; orderId: string; status: string }
  ) {
    // Only allow admin users or the order owner
    if (user.role !== 'ADMIN' && user.id !== body.userId) {
      return { success: false, error: 'Unauthorized' };
    }
    
    return this.pushService.sendOrderUpdate(body.userId, body.orderId, body.status);
  }

  @Post('abandoned-cart')
  @UseGuards(JwtAuthGuard)
  async sendAbandonedCartReminder(
    @CurrentUser() user: any,
    @Body() body: { userId: string; cartItems?: number }
  ) {
    // Only allow admin users
    if (user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }
    
    return this.pushService.sendAbandonedCartReminder(body.userId, body.cartItems);
  }

  @Post('promotion')
  @UseGuards(JwtAuthGuard)
  async sendPromotion(
    @CurrentUser() user: any,
    @Body() body: { userId?: string; title: string; message: string; url?: string }
  ) {
    // Only allow admin users
    if (user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }
    
    if (body.userId) {
      return this.pushService.sendPromotion(body.userId, body.title, body.message, body.url);
    } else {
      // Broadcast to all users
      return this.pushService.broadcastNotification({
        title: body.title,
        body: body.message,
        url: body.url
      });
    }
  }

  @Get('vapid-key')
  @Public()
  getVapidKey() {
    return this.pushService.getVapidPublicKey();
  }
}