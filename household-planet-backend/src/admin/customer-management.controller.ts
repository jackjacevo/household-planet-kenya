import { Controller, Get, Put, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CustomerManagementService } from './customer-management.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('api/admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CustomerManagementController {
  constructor(private customerManagementService: CustomerManagementService) {}

  @Get()
  async getCustomers(@Query() filters: any) {
    return this.customerManagementService.getCustomers(filters);
  }

  @Get('stats')
  async getCustomerStats() {
    return this.customerManagementService.getCustomerStats();
  }

  @Get('segments/:type')
  async getCustomerSegment(@Param('type') type: string) {
    return this.customerManagementService.segmentCustomers({ type });
  }

  @Get(':id')
  async getCustomer(@Param('id') id: string) {
    return this.customerManagementService.getCustomerById(id);
  }

  @Get(':id/insights')
  async getCustomerInsights(@Param('id') id: string) {
    return this.customerManagementService.getCustomerInsights(id);
  }

  @Get(':id/communication-log')
  async getCommunicationLog(@Param('id') id: string) {
    return this.customerManagementService.getCustomerCommunicationLog(id);
  }

  @Put(':id')
  async updateCustomer(@Param('id') id: string, @Body() data: any) {
    return this.customerManagementService.updateCustomer(id, data);
  }

  @Post(':id/tags')
  async addCustomerTag(@Param('id') id: string, @Body() data: { tag: string }) {
    return this.customerManagementService.addCustomerTag(id, data.tag);
  }

  @Delete(':id/tags/:tag')
  async removeCustomerTag(@Param('id') id: string, @Param('tag') tag: string) {
    return this.customerManagementService.removeCustomerTag(id, tag);
  }

  @Post(':id/loyalty')
  async manageLoyaltyPoints(
    @Param('id') id: string,
    @Body() data: { points: number; type: string; description: string }
  ) {
    return this.customerManagementService.manageLoyaltyPoints(id, data.points, data.type, data.description);
  }

  @Post(':id/support-tickets')
  async createSupportTicket(@Param('id') id: string, @Body() data: any) {
    return this.customerManagementService.createSupportTicket(id, data);
  }

  @Put('support-tickets/:ticketId')
  async updateSupportTicket(@Param('ticketId') ticketId: string, @Body() data: any) {
    return this.customerManagementService.updateSupportTicket(ticketId, data);
  }

  @Post('support-tickets/:ticketId/replies')
  async addTicketReply(
    @Param('ticketId') ticketId: string,
    @Body() data: { message: string; isStaff?: boolean }
  ) {
    return this.customerManagementService.addTicketReply(ticketId, data.message, data.isStaff);
  }

  @Post(':id/addresses/:addressId/verify')
  async verifyAddress(@Param('id') id: string, @Param('addressId') addressId: string) {
    return this.customerManagementService.verifyAddress(id, addressId);
  }
}