import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { GuestCartController } from './guest-cart.controller';
import { CartService } from './cart.service';
import { GuestCartService } from './guest-cart.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [PrismaModule, WhatsAppModule],
  controllers: [CartController, GuestCartController],
  providers: [CartService, GuestCartService],
  exports: [CartService, GuestCartService],
})
export class CartModule {}