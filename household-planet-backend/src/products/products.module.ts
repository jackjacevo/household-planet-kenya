import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    PrismaModule,
    UploadModule,
    CommonModule,
    MulterModule.register({
      dest: './uploads/products',
      limits: { fileSize: 5 * 1024 * 1024 } // 5MB
    })
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
