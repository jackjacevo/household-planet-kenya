import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DeliveryTrackingService } from './delivery-tracking.service';
import { DeliveryLocationsService } from './delivery-locations.service';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';

@Controller('delivery')
export class DeliveryController {
  constructor(
    private deliveryTrackingService: DeliveryTrackingService,
    private deliveryLocationsService: DeliveryLocationsService,
    private deliveryService: DeliveryService
  ) {}

  @Get('locations')
  async getLocations() {
    const locations = await this.deliveryLocationsService.getAllLocations();
    return {
      success: true,
      data: locations
    };
  }

  @Get('tracking/:trackingNumber')
  async getTracking(@Param('trackingNumber') trackingNumber: string) {
    return this.deliveryTrackingService.getDeliveryTracking(trackingNumber);
  }

  @Get('admin/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async getAdminDeliveries() {
    return this.deliveryService.getAdminDeliveries();
  }
}
