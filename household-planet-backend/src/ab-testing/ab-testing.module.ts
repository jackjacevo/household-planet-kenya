import { Module } from '@nestjs/common';
import { AbTestingController } from './ab-testing.controller';
import { AbTestingService } from './ab-testing.service';
import { ExperimentService } from './experiment.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AbTestingController],
  providers: [AbTestingService, ExperimentService],
  exports: [AbTestingService, ExperimentService],
})
export class AbTestingModule {}