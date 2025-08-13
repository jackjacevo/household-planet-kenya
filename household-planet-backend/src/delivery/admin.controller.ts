import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AdminDeliveryService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('api/admin/delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminDeliveryController {
  constructor(private adminDeliveryService: AdminDeliveryService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminDeliveryService.getDeliveryDashboard();
  }

  @Get('analytics')
  async getAnalytics(@Query('days') days?: string) {
    return this.adminDeliveryService.getDeliveryAnalytics(days ? parseInt(days) : 30);
  }

  @Get('failed')
  async getFailedDeliveries() {
    return this.adminDeliveryService.getFailedDeliveries();
  }

  @Post('bulk-update')
  async bulkUpdateStatus(@Body() data: { orderIds: string[]; status: string; notes?: string }) {
    return this.adminDeliveryService.bulkUpdateStatus(data.orderIds, data.status, data.notes);
  }
}