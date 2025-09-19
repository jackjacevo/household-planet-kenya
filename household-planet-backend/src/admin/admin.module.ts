import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminLoyaltyController } from './admin-loyalty.controller';
import { LoyaltyService } from '../customers/loyalty.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { CommonModule } from '../common/common.module';
import { ActivityModule } from '../activity/activity.module';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    PrismaModule,
    ProductsModule,
    CommonModule,
    ActivityModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 } // 10MB
    })
  ],
  controllers: [AdminController, AdminLoyaltyController],
  providers: [AdminService, LoyaltyService],
  exports: [AdminService]
})
export class AdminModule {}
