import { Controller, Get, Post, Query, Body, Param, UseGuards } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { TrackingService } from './tracking.service';
import { SchedulingService } from './scheduling.service';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('api/delivery')
export class DeliveryController {
  constructor(
    private deliveryService: DeliveryService,
    private trackingService: TrackingService,
    private schedulingService: SchedulingService,
    private feedbackService: FeedbackService
  ) {}

  @Post('initialize')
  async initializeLocations() {
    await this.deliveryService.initializeLocations();
    return { message: 'Delivery locations initialized successfully' };
  }

  @Get('locations')
  async getAllLocations() {
    return this.deliveryService.getAllLocations();
  }

  @Get('price')
  async getDeliveryPrice(@Query('location') location: string) {
    const price = await this.deliveryService.calculateDeliveryPrice(location);
    return { location, price };
  }

  @Get('locations/tier')
  async getLocationsByTier(@Query('tier') tier: string) {
    return this.deliveryService.getLocationsByTier(parseInt(tier));
  }

  @Get('estimate')
  async getDeliveryEstimate(@Query('location') location: string) {
    return this.deliveryService.getDeliveryEstimate(location);
  }

  @Get('tracking/:orderId')
  async getTracking(@Param('orderId') orderId: string) {
    return this.trackingService.getTracking(orderId);
  }

  @Post('tracking/:orderId/update')
  async updateTracking(
    @Param('orderId') orderId: string,
    @Body() data: { status: string; location?: string; notes?: string }
  ) {
    return this.trackingService.updateStatus(orderId, data.status, data.location, data.notes);
  }

  @Post('tracking/:orderId/confirm')
  async confirmDelivery(
    @Param('orderId') orderId: string,
    @Body() data: { photoProof?: string }
  ) {
    return this.trackingService.confirmDelivery(orderId, data.photoProof);
  }

  @UseGuards(JwtAuthGuard)
  @Post('schedule/:orderId')
  async scheduleDelivery(
    @Param('orderId') orderId: string,
    @Body() data: { preferredDate: string; timeSlot: string; instructions?: string }
  ) {
    return this.schedulingService.scheduleDelivery(
      orderId,
      new Date(data.preferredDate),
      data.timeSlot,
      data.instructions
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('feedback/:orderId')
  async submitFeedback(
    @Param('orderId') orderId: string,
    @Body() data: { rating: number; comment?: string }
  ) {
    return this.feedbackService.submitFeedback(orderId, data.rating, data.comment);
  }

  @Get('feedback/stats')
  async getFeedbackStats() {
    return this.feedbackService.getFeedbackStats();
  }
}