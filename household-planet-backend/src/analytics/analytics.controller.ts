import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { Role } from '../common/enums'

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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getDashboardData(@Query('period') period: string = '30d') {
    return this.analyticsService.getDashboardData(period)
  }

  @Get('conversion-funnel')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getConversionFunnel(@Query('period') period: string = '30d') {
    return this.analyticsService.getConversionFunnel(period)
  }

  @Get('top-products')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getTopProducts(@Query('period') period: string = '30d') {
    return this.analyticsService.getTopProducts(period)
  }

  @Get('user-journey')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getUserJourney(@Query('period') period: string = '30d') {
    return this.analyticsService.getUserJourney(period)
  }

  @Get('whatsapp-inquiries')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getWhatsAppInquiries(@Query('period') period: string = '30d') {
    // Return mock data for now
    return {
      success: true,
      data: {
        totalInquiries: 0,
        convertedInquiries: 0,
        conversionRate: 0,
        averageResponseTime: 0,
        inquiriesByDay: [],
        topProducts: []
      }
    }
  }
}
