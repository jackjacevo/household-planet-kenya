import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_TIME = 30 * 60 * 1000; // 30 minutes
  private readonly JWT_EXPIRY = '24h';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(forwardRef(() => ActivityService))
    private activityService: ActivityService,
  ) {}

  async validateUser(email: string, password: string, ipAddress: string, userAgent: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      await this.logLoginAttempt(email, ipAddress, userAgent, false, 'User not found');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.logLoginAttempt(email, ipAddress, userAgent, false, 'Account locked');
      throw new ForbiddenException('Account is temporarily locked');
    }

    // Check if account is active
    if (!user.isActive) {
      await this.logLoginAttempt(email, ipAddress, userAgent, false, 'Account deactivated');
      throw new ForbiddenException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id);
      await this.logLoginAttempt(email, ipAddress, userAgent, false, 'Invalid password');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset login attempts on successful login
    await this.resetLoginAttempts(user.id);
    
    // Log successful login attempt
    await this.logLoginAttempt(email, ipAddress, userAgent, true);

    // Fetch fresh user data to ensure we have the latest role and permissions
    const freshUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    const { password: _, resetToken, resetTokenExpiry, verificationToken, ...result } = freshUser;
    return result;
  }

  async login(loginDto: LoginDto, user: any, ipAddress: string, userAgent: string) {
    // Generate tokens
    const tokens = await this.generateTokens(user);
    
    // Create session
    await this.createSession(user.id, tokens.accessToken, tokens.refreshToken, ipAddress, userAgent);
    
    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Log admin activity for admin/staff users
    if (user.role === 'ADMIN' || user.role === 'STAFF' || user.role === 'SUPER_ADMIN') {
      try {
        await this.activityService.logActivity(
          user.id,
          'USER_LOGIN',
          {
            email: user.email,
            name: user.name,
            role: user.role,
            ipAddress,
            userAgent,
            loginTime: new Date().toISOString(),
            platform: this.extractPlatform(userAgent),
            browser: this.extractBrowser(userAgent)
          },
          'USER',
          user.id
        );
      } catch (error) {
        console.error('Failed to log admin login activity:', error);
      }
    }

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        permissions: user.permissions ? JSON.parse(user.permissions) : [],
      },
    };
  }

  async register(registerDto: RegisterDto, ipAddress: string, userAgent: string) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        name: `${registerDto.firstName} ${registerDto.lastName}`,
        phone: registerDto.phone,
        verificationToken,
        verificationTokenExpiry,
        role: UserRole.CUSTOMER,
      },
    });

    // Create email verification token
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: verificationTokenExpiry,
      }
    });

    // TODO: Send verification email
    
    const { password, resetToken, resetTokenExpiry, verificationToken: _, ...result } = user;
    return {
      user: result,
      message: 'Registration successful. Please check your email to verify your account.'
    };
  }

  async verifyEmail(token: string) {
    const verificationToken = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!verificationToken || verificationToken.used || verificationToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Mark token as used and verify user email
    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true }
      }),
      this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: { 
          emailVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null
        }
      })
    ]);

    return { message: 'Email verified successfully' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        }
      }),
      this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt: resetTokenExpiry,
        }
      })
    ]);

    // TODO: Send password reset email

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and mark token as used
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      }),
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
          loginAttempts: 0,
          lockedUntil: null,
        }
      })
    ]);

    // Invalidate all user sessions
    await this.prisma.userSession.updateMany({
      where: { userId: resetToken.userId },
      data: { isActive: false }
    });

    return { message: 'Password reset successful' };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Invalidate all other sessions except current one
    await this.prisma.userSession.updateMany({
      where: { 
        userId,
        isActive: true
      },
      data: { isActive: false }
    });

    return { message: 'Password changed successfully' };
  }

  async refreshToken(refreshToken: string) {
    const session = await this.prisma.userSession.findUnique({
      where: { refreshToken },
      include: { user: true }
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(session.user);
    
    // Update session with new tokens
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        lastUsedAt: new Date()
      }
    });

    return tokens;
  }

  async logout(userId: number, token: string) {
    // Get user info for logging
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true }
    });

    await this.prisma.userSession.updateMany({
      where: {
        userId,
        token,
        isActive: true
      },
      data: { isActive: false }
    });

    // Log admin activity for admin/staff users
    if (user && (user.role === 'ADMIN' || user.role === 'STAFF' || user.role === 'SUPER_ADMIN')) {
      try {
        await this.activityService.logActivity(
          user.id,
          'USER_LOGOUT',
          {
            email: user.email,
            name: user.name,
            role: user.role,
            logoutTime: new Date().toISOString()
          },
          'USER',
          user.id
        );
      } catch (error) {
        console.error('Failed to log admin logout activity:', error);
      }
    }

    return { message: 'Logged out successfully' };
  }

  async logoutAll(userId: number) {
    await this.prisma.userSession.updateMany({
      where: {
        userId,
        isActive: true
      },
      data: { isActive: false }
    });

    return { message: 'Logged out from all devices successfully' };
  }

  async sendPhoneVerification(userId: number, phone: string) {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save verification token
    await this.prisma.phoneVerificationToken.create({
      data: {
        userId,
        phone,
        token: code,
        expiresAt,
      }
    });

    // TODO: Send SMS via Africa's Talking
    console.log(`SMS Code for ${phone}: ${code}`);

    return { message: 'Verification code sent to your phone' };
  }

  async verifyPhone(userId: number, phone: string, code: string) {
    const verificationToken = await this.prisma.phoneVerificationToken.findFirst({
      where: {
        userId,
        phone,
        token: code,
        used: false,
        expiresAt: { gt: new Date() }
      }
    });

    if (!verificationToken) {
      // Increment attempts
      await this.prisma.phoneVerificationToken.updateMany({
        where: {
          userId,
          phone,
          used: false
        },
        data: {
          attempts: { increment: 1 }
        }
      });
      
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Mark token as used and verify phone
    await this.prisma.$transaction([
      this.prisma.phoneVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true }
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          phone,
          phoneVerified: true,
          phoneVerificationToken: null,
          phoneVerificationExpiry: null
        }
      })
    ]);

    return { message: 'Phone verified successfully' };
  }

  private async generateTokens(user: any) {
    const permissions = user.permissions ? JSON.parse(user.permissions) : [];
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      permissions
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_EXPIRY
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    };
  }

  private async createSession(userId: number, token: string, refreshToken: string, ipAddress: string, userAgent: string) {
    const deviceInfo = {
      userAgent,
      platform: this.extractPlatform(userAgent),
      browser: this.extractBrowser(userAgent)
    };

    return this.prisma.userSession.create({
      data: {
        userId,
        token,
        refreshToken,
        deviceInfo: JSON.stringify(deviceInfo),
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
    });
  }

  private async handleFailedLogin(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return;

    const loginAttempts = user.loginAttempts + 1;
    const updateData: any = { loginAttempts };

    if (loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + this.LOCK_TIME);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData
    });
  }

  private async resetLoginAttempts(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        loginAttempts: 0,
        lockedUntil: null
      }
    });
  }

  private async logLoginAttempt(email: string, ipAddress: string, userAgent: string, success: boolean, failureReason?: string) {
    await this.prisma.loginAttempt.create({
      data: {
        email,
        ipAddress,
        userAgent,
        success,
        failureReason
      }
    });
  }

  private extractPlatform(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private extractBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  // Additional methods for auth controller
  async forgotPassword(email: string) {
    return this.requestPasswordReset(email);
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true, 
        name: true, 
        role: true,
        emailVerified: true,
        phoneVerified: true,
        twoFactorEnabled: true,
        permissions: true
      }
    });
    
    if (user) {
      return {
        ...user,
        permissions: user.permissions ? JSON.parse(user.permissions) : []
      };
    }
    
    return user;
  }

  async updateProfile(userId: number, data: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, name: true, role: true }
    });
    return user;
  }

  async resendVerification(email: string, type: string) {
    return { message: 'Verification sent' };
  }

  async enableTwoFactor(userId: number) {
    return { message: '2FA enabled' };
  }

  async verifyTwoFactor(userId: number, code: string) {
    return { message: '2FA verified' };
  }

  async disableTwoFactor(userId: number, code: string) {
    return { message: '2FA disabled' };
  }

  async socialAuth(provider: string, data: any) {
    return { message: 'Social auth' };
  }

  async getUserSessions(userId: number) {
    return { sessions: [] };
  }
}
