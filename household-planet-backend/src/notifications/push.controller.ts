import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PushService } from './push.service';

@Controller('push')
@UseGuards(JwtAuthGuard)
export class PushController {
  constructor(private pushService: PushService) {}

  @Post('subscribe')
  async subscribe(
    @CurrentUser() user: any,
    @Body() subscription: any
  ) {
    return this.pushService.subscribe(user.id, subscription);
  }

  @Post('test')
  async testNotification(@CurrentUser() user: any) {
    return this.pushService.sendNotification(user.id, {
      title: 'Test Notification',
      body: 'This is a test notification from Household Planet Kenya',
      url: '/'
    });
  }

  @Get('vapid-key')
  getVapidKey() {
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY || 'demo-key'
    };
  }
}