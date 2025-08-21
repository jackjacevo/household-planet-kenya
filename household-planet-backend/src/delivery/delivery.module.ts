import { Module } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliveryTrackingService } from './delivery-tracking.service';
import { SmsService } from './sms.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DeliveryController],
  providers: [DeliveryService, DeliveryTrackingService, SmsService],
  exports: [DeliveryService, DeliveryTrackingService, SmsService],
})
export class DeliveryModule {}