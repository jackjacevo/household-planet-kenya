import { Controller, Post, Body, UseGuards, Get, Req, Put, Query, ValidationPipe, UsePipes, HttpCode, HttpStatus, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { TwoFactorDto } from './dto/two-factor.dto';
import { SocialAuthDto } from './dto/social-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async register(@Body() registerDto: RegisterDto, @Req() req) {
    const ipAddress = req.ip || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';
    return this.authService.register(registerDto, ipAddress, userAgent);
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(@Body() loginDto: LoginDto, @Req() req) {
    const ipAddress = req.ip || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    const user = await this.authService.validateUser(
      loginDto.email, 
      loginDto.password, 
      ipAddress, 
      userAgent
    );
    
    return this.authService.login(loginDto, user, ipAddress, userAgent);
  }

  @Post('forgot-password')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateProfile(@Req() req, @Body() updateData: any) {
    return this.authService.updateProfile(req.user.id, updateData);
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Post('resend-verification')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async resendVerification(@Body() resendDto: ResendVerificationDto) {
    return this.authService.resendVerification(resendDto.email, resendDto.type);
  }

  @Post('verify-phone')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async verifyPhone(@Req() req, @Body() verifyPhoneDto: VerifyPhoneDto) {
    return this.authService.verifyPhone(req.user.id, verifyPhoneDto.phone, verifyPhoneDto.code);
  }

  @Post('send-phone-verification')
  @UseGuards(AuthGuard('jwt'), ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  async sendPhoneVerification(@Req() req, @Body() body: any) {
    return this.authService.sendPhoneVerification(req.user.id, body.phone);
  }

  @Post('enable-2fa')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async enableTwoFactor(@Req() req) {
    return this.authService.enableTwoFactor(req.user.id);
  }

  @Post('verify-2fa')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async verifyTwoFactor(@Req() req, @Body() twoFactorDto: TwoFactorDto) {
    return this.authService.verifyTwoFactor(req.user.id, twoFactorDto.code);
  }

  @Post('disable-2fa')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async disableTwoFactor(@Req() req, @Body() twoFactorDto: TwoFactorDto) {
    return this.authService.disableTwoFactor(req.user.id, twoFactorDto.code);
  }

  @Post('social/google')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async googleAuth(@Body() socialAuthDto: SocialAuthDto) {
    return this.authService.socialAuth('google', socialAuthDto);
  }

  @Post('social/facebook')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async facebookAuth(@Body() socialAuthDto: SocialAuthDto) {
    return this.authService.socialAuth('facebook', socialAuthDto);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logout(req.user.id, token);
  }

  @Post('logout-all')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async logoutAll(@Req() req) {
    return this.authService.logoutAll(req.user.id);
  }

  @Get('sessions')
  @UseGuards(AuthGuard('jwt'))
  async getSessions(@Req() req) {
    return this.authService.getUserSessions(req.user.id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    return this.authService.refreshToken(refreshToken);
  }
}