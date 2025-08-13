import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { StaffManagementService } from './staff-management.service';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffReportingController {
  constructor(
    private staffManagementService: StaffManagementService,
    private reportingService: ReportingService
  ) {}

  // Staff Management
  @Get('staff')
  @Roles(UserRole.ADMIN)
  async getStaffMembers() {
    return this.staffManagementService.getStaffMembers();
  }

  @Post('staff')
  @Roles(UserRole.ADMIN)
  async createStaffMember(@Body() data: any, @CurrentUser() user: any) {
    const result = await this.staffManagementService.createStaffMember(data);
    await this.staffManagementService.logActivity(user.id, 'CREATE_STAFF', { staffId: result.id, role: data.role });
    return result;
  }

  @Put('staff/:id/role')
  @Roles(UserRole.ADMIN)
  async updateStaffRole(@Param('id') id: string, @Body() data: { role: string }, @CurrentUser() user: any) {
    const result = await this.staffManagementService.updateStaffRole(id, data.role);
    await this.staffManagementService.logActivity(user.id, 'UPDATE_STAFF_ROLE', { staffId: id, newRole: data.role });
    return result;
  }

  @Put('staff/:id/deactivate')
  @Roles(UserRole.ADMIN)
  async deactivateStaff(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.staffManagementService.deactivateStaff(id);
    await this.staffManagementService.logActivity(user.id, 'DEACTIVATE_STAFF', { staffId: id });
    return result;
  }

  @Get('staff/permissions/:role')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getStaffPermissions(@Param('role') role: string) {
    return this.staffManagementService.getStaffPermissions(role);
  }

  // Activity Logging
  @Get('activity-log')
  @Roles(UserRole.ADMIN)
  async getActivityLog(@Query() filters: any) {
    return this.staffManagementService.getActivityLog(filters);
  }

  @Post('activity-log')
  async logActivity(@Body() data: { action: string; details: any }, @CurrentUser() user: any) {
    return this.staffManagementService.logActivity(user.id, data.action, data.details);
  }

  // Reporting
  @Get('reports/sales')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getSalesReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    return this.reportingService.generateSalesReport(start, end);
  }

  @Get('reports/customers')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getCustomerReport() {
    return this.reportingService.generateCustomerReport();
  }

  @Get('reports/inventory')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getInventoryReport() {
    return this.reportingService.generateInventoryReport();
  }

  @Get('reports/financial')
  @Roles(UserRole.ADMIN)
  async getFinancialReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    return this.reportingService.generateFinancialReport(start, end);
  }
}