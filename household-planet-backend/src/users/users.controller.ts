import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto, AddAddressDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';

@Controller('users')
@UseGuards(JwtAuthGuard, ActiveUserGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @Get('addresses')
  getAddresses(@CurrentUser() user: any) {
    return this.usersService.getAddresses(user.id);
  }

  @Post('addresses')
  @UseGuards(EmailVerifiedGuard)
  addAddress(@CurrentUser() user: any, @Body() addAddressDto: AddAddressDto) {
    return this.usersService.addAddress(user.id, addAddressDto);
  }

  @Patch('addresses/:id')
  updateAddress(
    @CurrentUser() user: any,
    @Param('id') addressId: string,
    @Body() updateAddressDto: AddAddressDto,
  ) {
    return this.usersService.updateAddress(user.id, addressId, updateAddressDto);
  }

  @Delete('addresses/:id')
  deleteAddress(@CurrentUser() user: any, @Param('id') addressId: string) {
    return this.usersService.deleteAddress(user.id, addressId);
  }

  @Post('verify-phone')
  sendPhoneVerification(@CurrentUser() user: any) {
    return this.usersService.sendPhoneVerification(user.id);
  }

  @Post('verify-phone/:token')
  verifyPhone(@CurrentUser() user: any, @Param('token') token: string) {
    return this.usersService.verifyPhone(user.id, token);
  }

  // Admin endpoints
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Get('admin/all')
  getAllUsers() {
    return { message: 'Admin endpoint - get all users' };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('admin/:id/role')
  updateUserRole(
    @Param('id') userId: string,
    @Body('role') role: UserRole,
  ) {
    return { message: `Update user ${userId} role to ${role}` };
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @Patch('admin/:id/status')
  toggleUserStatus(
    @Param('id') userId: string,
    @Body('isActive') isActive: boolean,
  ) {
    return { message: `User ${userId} status updated to ${isActive ? 'active' : 'inactive'}` };
  }

  @Get('dashboard/stats')
  getDashboardStats(@CurrentUser('id') userId: string) {
    return this.usersService.getDashboardStats(userId);
  }

  @Patch('settings')
  updateSettings(@CurrentUser('id') userId: string, @Body() settings: {
    marketingEmails?: boolean;
    smsNotifications?: boolean;
    preferredLanguage?: string;
  }) {
    return this.usersService.updateSettings(userId, settings);
  }

  @Get('wishlist')
  getWishlist(@CurrentUser('id') userId: string) {
    return this.usersService.getWishlist(userId);
  }

  @Post('wishlist/:productId')
  addToWishlist(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.usersService.addToWishlist(userId, productId);
  }

  @Delete('wishlist/:productId')
  removeFromWishlist(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.usersService.removeFromWishlist(userId, productId);
  }
}