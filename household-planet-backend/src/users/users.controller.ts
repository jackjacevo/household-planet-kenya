import { Controller, Get, Put, Post, Delete, UseGuards, Request, Body, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateProfileDto, ChangePasswordDto, NotificationSettingsDto, PrivacySettingsDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('profile')
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.uploadAvatar(req.user.userId, file);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.userId, changePasswordDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('notifications')
  updateNotifications(@Request() req, @Body() notificationSettings: NotificationSettingsDto) {
    return this.usersService.updateNotificationSettings(req.user.userId, notificationSettings);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('privacy')
  updatePrivacy(@Request() req, @Body() privacySettings: PrivacySettingsDto) {
    return this.usersService.updatePrivacySettings(req.user.userId, privacySettings);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete-account')
  deleteAccount(@Request() req) {
    return this.usersService.deleteAccount(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('dashboard-stats')
  getDashboardStats(@Request() req) {
    return this.usersService.getDashboardStats(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('addresses')
  getAddresses(@Request() req) {
    return this.usersService.getAddresses(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('addresses')
  createAddress(@Request() req, @Body() addressData: any) {
    return this.usersService.createAddress(req.user.userId, addressData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('addresses/:id')
  updateAddress(@Request() req, @Param('id') id: string, @Body() addressData: any) {
    return this.usersService.updateAddress(req.user.userId, parseInt(id), addressData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('addresses/:id')
  deleteAddress(@Request() req, @Param('id') id: string) {
    return this.usersService.deleteAddress(req.user.userId, parseInt(id));
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('addresses/:id/default')
  setDefaultAddress(@Request() req, @Param('id') id: string) {
    return this.usersService.setDefaultAddress(req.user.userId, parseInt(id));
  }
}