import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  async trackEvent(@Body() eventData: {
    event: string
    properties: Record<string, any>
    userId?: string
    sessionId: string
  }) {
    return this.analyticsService.trackEvent(eventData)
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboardData(@Query('period') period: string = '30d') {
    return this.analyticsService.getDashboardData(period)
  }

  @Get('conversion-funnel')
  @UseGuards(JwtAuthGuard)
  async getConversionFunnel(@Query('period') period: string = '30d') {
    return this.analyticsService.getConversionFunnel(period)
  }

  @Get('top-products')
  @UseGuards(JwtAuthGuard)
  async getTopProducts(@Query('period') period: string = '30d') {
    return this.analyticsService.getTopProducts(period)
  }

  @Get('user-journey')
  @UseGuards(JwtAuthGuard)
  async getUserJourney(@Query('period') period: string = '30d') {
    return this.analyticsService.getUserJourney(period)
  }
}
