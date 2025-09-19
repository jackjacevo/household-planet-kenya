import { Module } from '@nestjs/common';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliveryTrackingService } from './delivery-tracking.service';
import { SmsService } from './sms.service';
import { DeliveryLocationsService } from './delivery-locations.service';
import { DeliveryLocationsController } from './delivery-locations.controller';
import { SimpleTrackingController } from './simple-tracking.controller';
import { SimpleDeliveryController } from './simple-delivery.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [DeliveryController, DeliveryLocationsController, SimpleTrackingController, SimpleDeliveryController],
  providers: [DeliveryService, DeliveryTrackingService, SmsService, DeliveryLocationsService],
  exports: [DeliveryService, DeliveryTrackingService, SmsService, DeliveryLocationsService],
})
export class DeliveryModule {}
