import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SendPhoneVerificationDto, VerifyPhoneDto } from './dto/verify-phone.dto';
import { SocialLoginDto, SocialUserDto } from './dto/social-login.dto';
import { UserRole } from '../common/enums';
import { GuestCartService } from '../cart/guest-cart.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private guestCartService: GuestCartService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Check if phone exists if provided
    if (registerDto.phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone: registerDto.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const emailVerifyToken = this.generateToken();

    const userData = {
      ...registerDto,
      password: hashedPassword,
      emailVerifyToken,
      dateOfBirth: registerDto.dateOfBirth ? new Date(registerDto.dateOfBirth) : null,
    };

    const user = await this.prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
      },
    });

    // TODO: Send verification email
    console.log(`Email verification token for ${user.email}: ${emailVerifyToken}`);

    return {
      user,
      message: 'Registration successful. Please verify your email.',
    };
  }

  async login(loginDto: LoginDto, guestCartItems?: any[]) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !await bcrypt.compare(loginDto.password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Merge guest cart if provided
    if (guestCartItems && guestCartItems.length > 0) {
      await this.guestCartService.mergeGuestCartWithUserCart(user.id, guestCartItems);
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      return { message: 'If email exists, reset link has been sent' };
    }

    const resetToken = this.generateToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // TODO: Send reset email
    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    return { message: 'If email exists, reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: resetPasswordDto.token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub, refreshToken },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = { email: user.email, sub: user.id, role: user.role };
      const accessToken = this.jwtService.sign(newPayload);

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: 'Logged out successfully' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async sendPhoneVerification(sendPhoneVerificationDto: SendPhoneVerificationDto) {
    const verificationCode = this.generatePhoneCode();
    
    // TODO: Integrate with Africa's Talking SMS API
    console.log(`SMS verification code for ${sendPhoneVerificationDto.phone}: ${verificationCode}`);
    
    // Store verification code temporarily (in production, use Redis)
    // For now, we'll store it in the user record
    const user = await this.prisma.user.findFirst({
      where: { phone: sendPhoneVerificationDto.phone },
    });

    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerifyToken: verificationCode },
      });
    }

    return { message: 'Verification code sent successfully' };
  }

  async verifyPhone(verifyPhoneDto: VerifyPhoneDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        phone: verifyPhoneDto.phone,
        phoneVerifyToken: verifyPhoneDto.code,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        phoneVerifyToken: null,
      },
    });

    return { message: 'Phone verified successfully' };
  }

  async socialLogin(socialLoginDto: SocialLoginDto) {
    // TODO: Verify token with respective social provider
    // This is a placeholder for social login implementation
    
    // Mock social user data - in production, fetch from provider API
    const socialUser: SocialUserDto = {
      id: 'mock_social_id',
      email: 'user@example.com',
      name: 'Social User',
      provider: socialLoginDto.provider,
    };

    let user = await this.prisma.user.findUnique({
      where: { email: socialUser.email },
    });

    if (!user) {
      // Create new user from social login
      user = await this.prisma.user.create({
        data: {
          email: socialUser.email,
          name: socialUser.name,
          password: await bcrypt.hash(Math.random().toString(36), 12), // Random password
          emailVerified: true, // Social logins are pre-verified
          socialProviders: JSON.stringify({ [socialUser.provider]: socialUser.id }),
          avatar: socialUser.avatar,
        },
      });
    } else {
      // Update social provider info
      const currentProviders = user.socialProviders ? JSON.parse(user.socialProviders) : {};
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          socialProviders: JSON.stringify({
            ...currentProviders,
            [socialUser.provider]: socialUser.id,
          }),
          lastLoginAt: new Date(),
        },
      });
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  async resendEmailVerification(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { message: 'If email exists, verification link has been sent' };
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const emailVerifyToken = this.generateToken();
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken },
    });

    // TODO: Send verification email
    console.log(`Email verification token for ${user.email}: ${emailVerifyToken}`);

    return { message: 'If email exists, verification link has been sent' };
  }

  private generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private generatePhoneCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}