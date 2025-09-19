import { Module } from '@nestjs/common'
import { AnalyticsController } from './analytics.controller'
import { AnalyticsService } from './analytics.service'
import { WhatsAppAnalyticsController } from './whatsapp-analytics.controller'
import { WhatsAppAnalyticsService } from './whatsapp-analytics.service'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController, WhatsAppAnalyticsController],
  providers: [AnalyticsService, WhatsAppAnalyticsService],
  exports: [AnalyticsService, WhatsAppAnalyticsService]
})
export class AnalyticsModule {}
