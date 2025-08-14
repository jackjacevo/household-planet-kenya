import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppBusinessController } from './business.controller';
import { AbandonedCartService } from './abandoned-cart.service';
import { WhatsAppTemplateService } from './template.service';
import { WhatsAppBusinessService } from './business.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    WhatsAppController,
    WhatsAppBusinessController,
  ],
  providers: [
    WhatsAppService,
    WhatsAppBusinessService,
    AbandonedCartService,
    WhatsAppTemplateService,
  ],
  exports: [
    WhatsAppService,
    WhatsAppBusinessService,
    AbandonedCartService,
    WhatsAppTemplateService,
  ],
})
export class WhatsAppModule {}