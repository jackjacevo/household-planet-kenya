import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailAutomationService } from './email-automation.service';
import { EmailTemplateSeederService } from './email-template-seeder.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EmailController],
  providers: [EmailService, EmailAutomationService, EmailTemplateSeederService],
  exports: [EmailService],
})
export class EmailModule {}