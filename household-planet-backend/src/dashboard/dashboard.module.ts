import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [AdminModule],
  controllers: [DashboardController],
})
export class DashboardModule {}