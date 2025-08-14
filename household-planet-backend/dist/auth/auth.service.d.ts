import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SendPhoneVerificationDto, VerifyPhoneDto } from './dto/verify-phone.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { GuestCartService } from '../cart/guest-cart.service';
import { AuthResponse } from '../types/user.interface';
import { InputSanitizerService } from '../security/input-sanitizer.service';
import { SecureLoggerService } from '../security/secure-logger.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private guestCartService;
    private sanitizer;
    private secureLogger;
    private readonly loginAttempts;
    private readonly maxLoginAttempts;
    private readonly lockoutDuration;
    constructor(prisma: PrismaService, jwtService: JwtService, guestCartService: GuestCartService, sanitizer: InputSanitizerService, secureLogger: SecureLoggerService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            name: string;
            email: string;
            phone: string;
            role: string;
            dateOfBirth: Date;
            gender: string;
            id: string;
            emailVerified: boolean;
        };
        message: string;
    }>;
    login(loginDto: LoginDto, guestCartItems?: any[]): Promise<AuthResponse>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    logout(userId: string | number): Promise<{
        message: string;
    }>;
    changePassword(userId: string | number, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    sendPhoneVerification(sendPhoneVerificationDto: SendPhoneVerificationDto): Promise<{
        message: string;
    }>;
    verifyPhone(verifyPhoneDto: VerifyPhoneDto): Promise<{
        message: string;
    }>;
    socialLogin(socialLoginDto: SocialLoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            emailVerified: boolean;
        };
    }>;
    resendEmailVerification(email: string): Promise<{
        message: string;
    }>;
    private generateToken;
    private generatePhoneCode;
    private isAccountLocked;
    private recordFailedLogin;
    private clearFailedLogins;
}
