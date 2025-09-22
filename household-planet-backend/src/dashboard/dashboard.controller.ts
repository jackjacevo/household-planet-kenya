import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from '../admin/admin.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private adminService: AdminService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getDashboard() {
    return this.adminService.getDashboardStats();
  }
}