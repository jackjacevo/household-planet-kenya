import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { WhatsAppService } from './whatsapp.service';
import { ShippingService } from './shipping.service';
import { OrdersController } from './orders.controller';
import { DeliveryModule } from '../delivery/delivery.module';
import { CustomersModule } from '../customers/customers.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, DeliveryModule, CustomersModule],
  providers: [OrdersService, WhatsAppService, ShippingService],
  controllers: [OrdersController],
})
export class OrdersModule {}