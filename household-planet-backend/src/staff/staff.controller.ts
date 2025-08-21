import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StaffService } from './staff.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';

@Controller('admin/staff')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get()
  getAllStaff() {
    return this.staffService.getAllStaff();
  }

  @Post()
  createStaff(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.createStaff(createStaffDto);
  }

  @Put(':id')
  updateStaff(@Param('id', ParseIntPipe) id: number, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.updateStaff(id, updateStaffDto);
  }

  @Delete(':id')
  deleteStaff(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.deleteStaff(id);
  }

  @Put(':id/permissions')
  updatePermissions(@Param('id', ParseIntPipe) id: number, @Body() permissions: string[]) {
    return this.staffService.updatePermissions(id, permissions);
  }
}