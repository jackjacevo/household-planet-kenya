import { Controller, Get, Param } from '@nestjs/common';
import { DeliveryTrackingService } from './delivery-tracking.service';

@Controller('delivery')
export class DeliveryController {
  constructor(private deliveryTrackingService: DeliveryTrackingService) {}

  @Get('tracking/:trackingNumber')
  async getTracking(@Param('trackingNumber') trackingNumber: string) {
    return this.deliveryTrackingService.getDeliveryTracking(trackingNumber);
  }
}