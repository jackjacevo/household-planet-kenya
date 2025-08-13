import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AnalyticsService } from './analytics.service';
import { ProductManagementService } from './product-management.service';
import { ProductManagementController, CategoryManagementController } from './product-management.controller';
import { OrderManagementService } from './order-management.service';
import { OrderManagementController } from './order-management.controller';
import { CustomerManagementService } from './customer-management.service';
import { CustomerManagementController } from './customer-management.controller';
import { ContentManagementService } from './content-management.service';
import { ContentManagementController } from './content-management.controller';
import { StaffManagementService } from './staff-management.service';
import { ReportingService } from './reporting.service';
import { StaffReportingController } from './staff-reporting.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController, ProductManagementController, CategoryManagementController, OrderManagementController, CustomerManagementController, ContentManagementController, StaffReportingController],
  providers: [AdminService, AnalyticsService, ProductManagementService, OrderManagementService, CustomerManagementService, ContentManagementService, StaffManagementService, ReportingService],
  exports: [AdminService, AnalyticsService, ProductManagementService, OrderManagementService, CustomerManagementService, ContentManagementService, StaffManagementService, ReportingService]
})
export class AdminModule {}