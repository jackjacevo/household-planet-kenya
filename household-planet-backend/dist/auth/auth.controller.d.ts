import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SendPhoneVerificationDto, VerifyPhoneDto } from './dto/verify-phone.dto';
import { SocialLoginDto } from './dto/social-login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    login(loginDto: LoginDto): Promise<{
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
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    resendEmailVerification(email: string): Promise<{
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
    changePassword(user: any, changePasswordDto: ChangePasswordDto): Promise<{
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
    logout(user: any): Promise<{
        message: string;
    }>;
    getProfile(user: any): {
        user: any;
    };
}
