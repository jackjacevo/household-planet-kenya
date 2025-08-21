import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MpesaService } from './mpesa.service';
import { SmsService } from './sms.service';
import { TokenizationService } from './tokenization.service';
import { ComplianceService } from './compliance.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, MpesaService, SmsService, TokenizationService, ComplianceService],
  exports: [PaymentsService, MpesaService, TokenizationService],
})
export class PaymentsModule {}