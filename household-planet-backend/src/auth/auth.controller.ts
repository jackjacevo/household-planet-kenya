import { Controller, Post, UseGuards, Request, Body, Get, Param, Ip, Headers, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { SendPhoneVerificationDto, VerifyPhoneDto } from './dto/verify-phone.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 registrations per minute
  async register(
    @Body(ValidationPipe) registerDto: RegisterDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string = 'Unknown'
  ) {
    return this.authService.register(registerDto, ipAddress, userAgent);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 login attempts per minute
  async login(
    @Request() req,
    @Body(ValidationPipe) loginDto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string = 'Unknown'
  ) {
    return this.authService.login(loginDto, req.user, ipAddress, userAgent);
  }

  @Post('refresh')
  async refreshToken(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: any,
    @Headers('authorization') authorization: string
  ) {
    const token = authorization?.replace('Bearer ', '');
    return this.authService.logout(user.id, token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(@CurrentUser() user: any) {
    return this.authService.logoutAll(user.id);
  }

  @Post('verify-email')
  async verifyEmail(@Body(ValidationPipe) verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes
  async forgotPassword(@Body(ValidationPipe) forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body(ValidationPipe) resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: any,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-phone-verification')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 SMS per 5 minutes
  async sendPhoneVerification(
    @CurrentUser() user: any,
    @Body(ValidationPipe) sendPhoneVerificationDto: SendPhoneVerificationDto
  ) {
    return this.authService.sendPhoneVerification(user.id, sendPhoneVerificationDto.phone);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-phone')
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 attempts per 5 minutes
  async verifyPhone(
    @CurrentUser() user: any,
    @Body(ValidationPipe) verifyPhoneDto: VerifyPhoneDto
  ) {
    return this.authService.verifyPhone(user.id, verifyPhoneDto.phone, verifyPhoneDto.code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@CurrentUser() user: any) {
    // TODO: Implement session listing
    return { message: 'Sessions endpoint - to be implemented' };
  }
}
