import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Query
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { DeliveryLocationsService, DeliveryLocationData } from './delivery-locations.service';

@Controller('admin/delivery-locations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.STAFF)
export class DeliveryLocationsController {
  constructor(private readonly deliveryLocationsService: DeliveryLocationsService) {}

  @Get()
  async getAllLocations() {
    const locations = await this.deliveryLocationsService.getAllLocations();
    return {
      success: true,
      data: locations
    };
  }

  @Get('tiers')
  async getLocationsByTier(@Query('tier') tier: string) {
    const tierNumber = parseInt(tier);
    const locations = await this.deliveryLocationsService.getLocationsByTier(tierNumber);
    return {
      success: true,
      data: locations
    };
  }

  @Get('search')
  async searchLocations(@Query('q') query: string) {
    const locations = await this.deliveryLocationsService.searchLocations(query);
    return {
      success: true,
      data: locations
    };
  }

  @Get(':id')
  async getLocationById(@Param('id') id: string) {
    const location = await this.deliveryLocationsService.getLocationById(id);
    return {
      success: true,
      data: location
    };
  }

  @Post()
  async createLocation(@Body() locationData: Omit<DeliveryLocationData, 'id'>) {
    const location = await this.deliveryLocationsService.createLocation(locationData);
    return {
      success: true,
      data: location,
      message: 'Delivery location created successfully'
    };
  }

  @Put(':id')
  async updateLocation(
    @Param('id') id: string,
    @Body() locationData: Partial<DeliveryLocationData>
  ) {
    const location = await this.deliveryLocationsService.updateLocation(id, locationData);
    return {
      success: true,
      data: location,
      message: 'Delivery location updated successfully'
    };
  }

  @Delete(':id')
  async deleteLocation(@Param('id') id: string) {
    await this.deliveryLocationsService.deleteLocation(id);
    return {
      success: true,
      message: 'Delivery location deleted successfully'
    };
  }

  @Post('seed')
  async seedDefaultLocations() {
    await this.deliveryLocationsService.seedDefaultLocations();
    return {
      success: true,
      message: 'Default delivery locations seeded successfully'
    };
  }
}
