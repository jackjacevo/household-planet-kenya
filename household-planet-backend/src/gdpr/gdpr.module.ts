import { Module } from '@nestjs/common';
import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';
import { GdprSchedulerService } from './gdpr-scheduler.service';
import { DataBreachService } from './data-breach.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GdprController],
  providers: [GdprService, GdprSchedulerService, DataBreachService],
  exports: [GdprService],
})
export class GdprModule {}
