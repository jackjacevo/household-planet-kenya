import { Controller, Get, Query, Post, Body, Param, Put } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryTrackingService } from './delivery-tracking.service';
import { SmsService } from './sms.service';
import { ScheduleDeliveryDto, UpdateDeliveryStatusDto, DeliveryFeedbackDto } from './dto/delivery.dto';

@Controller('delivery')
export class DeliveryController {
  constructor(
    private readonly deliveryService: DeliveryService,
    private readonly trackingService: DeliveryTrackingService,
    private readonly smsService: SmsService
  ) {}

  @Get('locations')
  getAllLocations() {
    return {
      success: true,
      data: this.deliveryService.getAllLocations()
    };
  }

  @Get('locations/tier')
  getLocationsByTier(@Query('tier') tier: string) {
    const tierNumber = parseInt(tier);
    return {
      success: true,
      data: this.deliveryService.getLocationsByTier(tierNumber)
    };
  }

  @Get('price')
  getDeliveryPrice(@Query('location') location: string) {
    const result = this.deliveryService.getDeliveryPrice(location);
    return {
      success: true,
      price: result.price,
      location: result.location
    };
  }

  @Get('estimate')
  getDeliveryEstimate(@Query('location') location: string) {
    const result = this.deliveryService.getDeliveryEstimate(location);
    return {
      success: true,
      ...result
    };
  }

  @Get('search')
  searchLocations(@Query('q') query: string) {
    return {
      success: true,
      data: this.deliveryService.searchLocations(query)
    };
  }

  @Get('tiers')
  getTierInfo() {
    return {
      success: true,
      data: this.deliveryService.getTierInfo()
    };
  }

  @Post('calculate')
  calculateShipping(@Body() body: { location: string; orderValue: number; isExpress?: boolean }) {
    const result = this.deliveryService.calculateShippingCost(body.location, body.orderValue, body.isExpress);
    return { success: true, ...result };
  }

  @Get('time-slots')
  getTimeSlots() {
    return {
      success: true,
      data: this.deliveryService.getTimeSlots()
    };
  }

  @Post('schedule')
  async scheduleDelivery(@Body() dto: ScheduleDeliveryDto) {
    const delivery = await this.trackingService.scheduleDelivery(dto);
    return { success: true, data: delivery };
  }

  @Get('track/:trackingNumber')
  async trackDelivery(@Param('trackingNumber') trackingNumber: string) {
    const tracking = await this.trackingService.getDeliveryTracking(trackingNumber);
    return { success: true, data: tracking };
  }

  @Put('track/:trackingNumber/status')
  async updateDeliveryStatus(
    @Param('trackingNumber') trackingNumber: string,
    @Body() dto: UpdateDeliveryStatusDto
  ) {
    const delivery = await this.trackingService.updateDeliveryStatus(trackingNumber, dto);
    return { success: true, data: delivery };
  }

  @Post('track/:trackingNumber/feedback')
  async submitFeedback(
    @Param('trackingNumber') trackingNumber: string,
    @Body() dto: DeliveryFeedbackDto
  ) {
    const feedback = await this.trackingService.submitFeedback(trackingNumber, dto);
    return { success: true, data: feedback };
  }

  @Get('analytics')
  async getAnalytics() {
    const analytics = await this.trackingService.getDeliveryAnalytics();
    return { success: true, data: analytics };
  }
}