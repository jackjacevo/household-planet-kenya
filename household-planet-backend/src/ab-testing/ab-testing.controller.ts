import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AbTestingService } from './ab-testing.service';
import { ExperimentService } from './experiment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('api/ab-testing')
export class AbTestingController {
  constructor(
    private abTestingService: AbTestingService,
    private experimentService: ExperimentService,
  ) {}

  // Public endpoints for frontend
  @Public()
  @Get('experiment/:type/config')
  async getExperimentConfig(
    @Param('type') type: string,
    @Query('userId') userId?: string,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.experimentService.getExperimentConfig(type, userId, sessionId);
  }

  @Public()
  @Post('track/conversion')
  async trackConversion(@Body() data: {
    experimentId: string;
    userId?: string;
    sessionId?: string;
    eventType: string;
    eventValue?: number;
    metadata?: any;
  }) {
    return this.abTestingService.trackConversion({
      experimentId: data.experimentId,
      userId: data.userId,
      event: data.eventType,
      value: data.eventValue,
    });
  }

  @Public()
  @Post('track/purchase')
  async trackPurchase(@Body() data: {
    experimentId: string;
    userId?: string;
    sessionId?: string;
    orderValue?: number;
  }) {
    return this.experimentService.trackPurchase(
      data.experimentId,
      data.userId,
      data.sessionId,
      data.orderValue,
    );
  }

  @Public()
  @Post('track/add-to-cart')
  async trackAddToCart(@Body() data: {
    experimentId: string;
    userId?: string;
    sessionId?: string;
    productPrice?: number;
  }) {
    return this.experimentService.trackAddToCart(
      data.experimentId,
      data.userId,
      data.sessionId,
      data.productPrice,
    );
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('experiments')
  async getAllExperiments() {
    return this.abTestingService.getAllExperiments();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('experiments/active')
  async getActiveExperiments() {
    return this.abTestingService.getActiveExperiments();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('experiments')
  async createExperiment(@Body() data: any) {
    return this.abTestingService.createExperiment(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('experiments/templates/button-color')
  async createButtonColorExperiment() {
    return this.experimentService.createButtonColorExperiment();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('experiments/templates/checkout-layout')
  async createCheckoutLayoutExperiment() {
    return this.experimentService.createCheckoutLayoutExperiment();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('experiments/templates/pricing-display')
  async createPricingDisplayExperiment() {
    return this.experimentService.createPricingDisplayExperiment();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('experiments/templates/product-layout')
  async createProductPageLayoutExperiment() {
    return this.experimentService.createProductPageLayoutExperiment();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('experiments/templates/hero-content')
  async createContentExperiment() {
    return this.experimentService.createContentExperiment();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('experiments/:id/results')
  async getExperimentResults(@Param('id') experimentId: string) {
    return this.abTestingService.getExperimentResults(experimentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('experiments/:id/recommendations')
  async getRecommendations(@Param('id') experimentId: string) {
    return this.experimentService.getRecommendations(experimentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('experiments/:id/status')
  async updateExperimentStatus(
    @Param('id') experimentId: string,
    @Body() data: { status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' },
  ) {
    return this.abTestingService.updateExperimentStatus(experimentId, data.status);
  }
}