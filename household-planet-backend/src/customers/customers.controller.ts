import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { CustomersService } from './customers.service';
import { LoyaltyService } from './loyalty.service';
import { AddressVerificationService } from './address-verification.service';
import { CreateCustomerTagDto, UpdateCustomerProfileDto, CustomerCommunicationDto } from './dto/customer.dto';
import { CreateLoyaltyProgramDto, CreateLoyaltyRewardDto } from './dto/loyalty.dto';
import { VerifyAddressDto } from './dto/address-verification.dto';
import { BulkTagCustomersDto } from './dto/bulk-tag.dto';
import { BulkDeleteCustomersDto } from './dto/bulk-delete.dto';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(
    private customersService: CustomersService,
    private loyaltyService: LoyaltyService,
    private addressVerificationService: AddressVerificationService,
  ) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.customersService.getCustomerProfile(req.user.userId);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateDto: UpdateCustomerProfileDto) {
    return this.customersService.createOrUpdateProfile(req.user.userId, updateDto);
  }

  @Get('orders')
  async getOrderHistory(@Request() req, @Query('page') page = '1', @Query('limit') limit = '10') {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      throw new Error('Invalid page or limit parameters');
    }
    return this.customersService.getCustomerOrderHistory(req.user.userId, pageNum, limitNum);
  }

  @Get('loyalty')
  async getLoyaltyStatus(@Request() req) {
    return this.loyaltyService.getCustomerLoyaltyStatus(req.user.userId);
  }

  @Post('loyalty/redeem/:rewardId')
  async redeemReward(@Request() req, @Param('rewardId') rewardId: string) {
    return this.loyaltyService.redeemPoints(req.user.userId, +rewardId);
  }

  @Get('communications')
  async getCommunications(@Request() req, @Query('page') page = '1', @Query('limit') limit = '20') {
    const profile = await this.customersService.getCustomerProfile(req.user.userId);
    if (!profile) return { communications: [] };
    return this.customersService.getCommunicationHistory(profile.id, +page, +limit);
  }

  // Admin endpoints
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get('search')
  async searchCustomers(@Query('q') query: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.customersService.searchCustomers(query, +page, +limit);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get('real-users')
  async getRealCustomers(@Query('q') query: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.customersService.searchRealCustomers(query, +page, +limit);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get('segment')
  async getCustomersBySegment(@Query('tags') tags: string, @Query('page') page = '1', @Query('limit') limit = '50') {
    if (!tags || typeof tags !== 'string') {
      throw new Error('Tags parameter is required');
    }
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    if (tagArray.length === 0) {
      throw new Error('At least one valid tag is required');
    }
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      throw new Error('Invalid page or limit parameters');
    }
    return this.customersService.getCustomersBySegment(tagArray, pageNum, limitNum);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Post(':id/tags')
  async addTag(@Param('id') profileId: string, @Body() tagDto: CreateCustomerTagDto) {
    return this.customersService.addCustomerTag(+profileId, tagDto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Delete(':id/tags/:tag')
  async removeTag(@Param('id') profileId: string, @Param('tag') tag: string) {
    return this.customersService.removeCustomerTag(+profileId, tag);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Post(':id/communications')
  async logCommunication(@Param('id') profileId: string, @Body() communicationDto: CustomerCommunicationDto) {
    return this.customersService.logCommunication(+profileId, communicationDto);
  }

  // Loyalty program management
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('loyalty/programs')
  async createLoyaltyProgram(@Body() programDto: CreateLoyaltyProgramDto) {
    return this.loyaltyService.createProgram(programDto);
  }

  @Get('loyalty/programs')
  async getLoyaltyPrograms() {
    return this.loyaltyService.getActivePrograms();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('loyalty/rewards')
  async createLoyaltyReward(@Body() rewardDto: CreateLoyaltyRewardDto) {
    return this.loyaltyService.createReward(rewardDto);
  }

  // Address verification
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get('addresses/pending-verification')
  async getPendingVerifications() {
    return this.addressVerificationService.getPendingVerifications();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Post('addresses/:id/verify')
  async verifyAddress(@Param('id') addressId: string, @Body() verificationDto: VerifyAddressDto) {
    return this.addressVerificationService.verifyAddress(+addressId, verificationDto);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get('addresses/verification-stats')
  async getVerificationStats() {
    return this.addressVerificationService.getVerificationStats();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get(':id/details')
  async getCustomerDetails(@Param('id') userId: string) {
    return this.customersService.getCustomerDetails(+userId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get('analytics/overview')
  async getCustomerAnalytics() {
    return this.customersService.getCustomerAnalytics();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Post('bulk-tag')
  async bulkTagCustomers(@Body() data: BulkTagCustomersDto) {
    return this.customersService.bulkTagCustomers(data.customerIds, data.tag);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get(':id/lifetime-value')
  async getCustomerLifetimeValue(@Param('id') userId: string) {
    return this.customersService.getCustomerLifetimeValue(+userId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('bulk')
  async bulkDeleteCustomers(@Body() data: any) {
    console.log('Bulk delete received data:', data);
    console.log('Customer IDs:', data.customerIds);
    return await this.customersService.bulkDeleteCustomers(data.customerIds);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteCustomer(@Param('id') userId: string) {
    console.log('Single delete called with userId:', userId);
    return this.customersService.deleteCustomer(+userId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('bulk-test')
  async testBulkEndpoint(@Body() data: any) {
    console.log('Test endpoint reached with data:', data);
    return { success: true, data };
  }
}
