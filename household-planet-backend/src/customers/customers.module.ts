import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { LoyaltyService } from './loyalty.service';
import { AddressVerificationService } from './address-verification.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CustomersService, LoyaltyService, AddressVerificationService],
  controllers: [CustomersController],
  exports: [CustomersService, LoyaltyService, AddressVerificationService],
})
export class CustomersModule {}
