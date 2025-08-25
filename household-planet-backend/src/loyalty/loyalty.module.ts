import { Module } from '@nestjs/common';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from '../customers/loyalty.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
})
export class LoyaltyModule {}