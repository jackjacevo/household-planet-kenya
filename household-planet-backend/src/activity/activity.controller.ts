import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActivityService } from './activity.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums';

@Controller('admin/activities')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get()
  getActivities(@Query() query: any) {
    return this.activityService.getActivities(query);
  }

  @Get('stats')
  getActivityStats() {
    return this.activityService.getActivityStats();
  }
}