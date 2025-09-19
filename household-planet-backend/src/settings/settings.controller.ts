import { Controller, Get, Post, Put, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Get('public')
  async getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @Put()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async updateSettings(@Body() settings: any, @Req() req) {
    return this.settingsService.updateSettings(settings, req.user.id);
  }

  @Post('company')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async updateCompanySettings(@Body() companySettings: any, @Req() req) {
    return this.settingsService.updateCompanySettings(companySettings, req.user.id);
  }

  @Post('payment')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async updatePaymentSettings(@Body() paymentSettings: any, @Req() req) {
    return this.settingsService.updatePaymentSettings(paymentSettings, req.user.id);
  }

  @Post('delivery')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async updateDeliverySettings(@Body() deliverySettings: any, @Req() req) {
    return this.settingsService.updateDeliverySettings(deliverySettings, req.user.id);
  }

  @Post('notification')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async updateNotificationSettings(@Body() notificationSettings: any, @Req() req) {
    return this.settingsService.updateNotificationSettings(notificationSettings, req.user.id);
  }
}