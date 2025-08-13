import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SearchService } from './services/search.service';
import { RecommendationsService } from './services/recommendations.service';
import { InventoryService } from './services/inventory.service';
import { BulkImportService } from './services/bulk-import.service';
import { TaskSchedulerService } from './services/task-scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    SearchService,
    RecommendationsService,
    InventoryService,
    BulkImportService,
    TaskSchedulerService
  ],
  exports: [ProductsService, RecommendationsService, InventoryService]
})
export class ProductsModule {}