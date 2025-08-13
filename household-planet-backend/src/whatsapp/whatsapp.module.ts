import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { AbandonedCartService } from './abandoned-cart.service';
import { WhatsAppTemplateService } from './template.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppService,
    AbandonedCartService,
    WhatsAppTemplateService,
  ],
  exports: [
    WhatsAppService,
    AbandonedCartService,
    WhatsAppTemplateService,
  ],
})
export class WhatsAppModule {}