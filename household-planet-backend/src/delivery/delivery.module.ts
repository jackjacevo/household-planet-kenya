import { Module } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { AdminDeliveryController } from './admin.controller';
import { DeliveryService } from './delivery.service';
import { AdminDeliveryService } from './admin.service';
import { TrackingService } from './tracking.service';
import { SchedulingService } from './scheduling.service';
import { FeedbackService } from './feedback.service';
import { SmsService } from './sms.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeliveryController, AdminDeliveryController],
  providers: [DeliveryService, AdminDeliveryService, TrackingService, SchedulingService, FeedbackService, SmsService],
  exports: [DeliveryService, TrackingService],
})
export class DeliveryModule {}