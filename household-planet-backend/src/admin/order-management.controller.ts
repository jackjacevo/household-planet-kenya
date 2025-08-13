import { Controller, Get, Put, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { OrderManagementService } from './order-management.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('api/admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class OrderManagementController {
  constructor(private orderManagementService: OrderManagementService) {}

  @Get()
  async getOrders(@Query() filters: any) {
    return this.orderManagementService.getOrders(filters);
  }

  @Get('stats')
  async getOrderStats() {
    return this.orderManagementService.getOrderStats();
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.orderManagementService.getOrderById(id);
  }

  @Put(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() data: { status: string; notes?: string }
  ) {
    return this.orderManagementService.updateOrderStatus(id, data.status, data.notes);
  }

  @Put('bulk/update')
  async bulkUpdateOrders(@Body() data: { orderIds: string[]; updates: any }) {
    return this.orderManagementService.bulkUpdateOrders(data.orderIds, data.updates);
  }

  @Post(':id/verify-payment')
  async verifyPayment(@Param('id') id: string) {
    return this.orderManagementService.verifyPayment(id);
  }

  @Post(':id/shipping-label')
  async generateShippingLabel(@Param('id') id: string) {
    return this.orderManagementService.generateShippingLabel(id);
  }

  @Put(':id/delivery')
  async updateDeliveryStatus(
    @Param('id') id: string,
    @Body() data: { status: string; location?: string; notes?: string }
  ) {
    return this.orderManagementService.updateDeliveryStatus(id, data.status, data.location, data.notes);
  }

  @Post(':id/notes')
  async addOrderNote(@Param('id') id: string, @Body() data: { notes: string }) {
    return this.orderManagementService.addOrderNote(id, data.notes);
  }

  @Put('returns/:id')
  async processReturn(
    @Param('id') id: string,
    @Body() data: { status: 'APPROVED' | 'REJECTED'; notes?: string }
  ) {
    return this.orderManagementService.processReturn(id, data.status, data.notes);
  }

  @Post(':id/email')
  async sendCustomerEmail(
    @Param('id') id: string,
    @Body() data: { template: string; customMessage?: string }
  ) {
    return this.orderManagementService.sendCustomerEmail(id, data.template, data.customMessage);
  }
}