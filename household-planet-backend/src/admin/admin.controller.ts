import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private analyticsService: AnalyticsService
  ) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardOverview();
  }

  @Get('analytics/sales')
  async getSalesAnalytics(@Query('period') period = '30d') {
    return this.analyticsService.getSalesAnalytics(period);
  }

  @Get('analytics/customers')
  async getCustomerAnalytics() {
    return this.analyticsService.getCustomerAnalytics();
  }

  @Get('analytics/products')
  async getProductAnalytics() {
    return this.analyticsService.getProductAnalytics();
  }

  @Get('analytics/geographic')
  async getGeographicAnalytics() {
    return this.analyticsService.getGeographicAnalytics();
  }

  @Get('alerts')
  async getAlerts() {
    return this.adminService.getSystemAlerts();
  }

  @Get('activities')
  async getRecentActivities(@Query('limit') limit = '20') {
    return this.adminService.getRecentActivities(parseInt(limit));
  }

  @Get('kpis')
  async getKPIs() {
    return this.analyticsService.getKPIs();
  }
}