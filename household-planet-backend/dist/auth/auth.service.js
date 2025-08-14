"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../prisma/prisma.service");
const guest_cart_service_1 = require("../cart/guest-cart.service");
const type_conversion_util_1 = require("../common/utils/type-conversion.util");
const input_sanitizer_service_1 = require("../security/input-sanitizer.service");
const secure_logger_service_1 = require("../security/secure-logger.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, guestCartService, sanitizer, secureLogger) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.guestCartService = guestCartService;
        this.sanitizer = sanitizer;
        this.secureLogger = secureLogger;
        this.loginAttempts = new Map();
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000;
    }
    async register(registerDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User already exists');
        }
        if (registerDto.phone) {
            const existingPhone = await this.prisma.user.findFirst({
                where: { phone: registerDto.phone },
            });
            if (existingPhone) {
                throw new common_1.ConflictException('Phone number already exists');
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
        console.log(`Email verification token for ${user.email}: ${emailVerifyToken}`);
        return {
            user,
            message: 'Registration successful. Please verify your email.',
        };
    }
    async login(loginDto, guestCartItems) {
        if (this.isAccountLocked(loginDto.email)) {
            throw new common_1.UnauthorizedException('Account temporarily locked due to too many failed attempts');
        }
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });
        if (!user || !await bcrypt.compare(loginDto.password, user.password)) {
            this.recordFailedLogin(loginDto.email);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        this.clearFailedLogins(loginDto.email);
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
                isActive: user.isActive,
                phoneVerified: user.phoneVerified,
            },
        };
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findFirst({
            where: { emailVerifyToken: token },
        });
        if (!user) {
            throw new common_1.NotFoundException('Invalid verification token');
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
    async forgotPassword(forgotPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: forgotPasswordDto.email },
        });
        if (!user) {
            return { message: 'If email exists, reset link has been sent' };
        }
        const resetToken = this.generateToken();
        const resetExpires = new Date(Date.now() + 3600000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetExpires,
            },
        });
        console.log(`Password reset token for ${user.email}: ${resetToken}`);
        return { message: 'If email exists, reset link has been sent' };
    }
    async resetPassword(resetPasswordDto) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetPasswordToken: resetPasswordDto.token,
                resetPasswordExpires: { gt: new Date() },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid or expired reset token');
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
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub, refreshToken },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const newPayload = { email: user.email, sub: user.id, role: user.role };
            const accessToken = this.jwtService.sign(newPayload);
            return { accessToken };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId) {
        const userIdStr = (0, type_conversion_util_1.ensureStringUserId)(userId);
        await this.prisma.user.update({
            where: { id: userIdStr },
            data: { refreshToken: null },
        });
        return { message: 'Logged out successfully' };
    }
    async changePassword(userId, changePasswordDto) {
        const userIdStr = (0, type_conversion_util_1.ensureStringUserId)(userId);
        const user = await this.prisma.user.findUnique({
            where: { id: userIdStr },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 12);
        await this.prisma.user.update({
            where: { id: userIdStr },
            data: { password: hashedNewPassword },
        });
        return { message: 'Password changed successfully' };
    }
    async sendPhoneVerification(sendPhoneVerificationDto) {
        const verificationCode = this.generatePhoneCode();
        console.log(`SMS verification code for ${sendPhoneVerificationDto.phone}: ${verificationCode}`);
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
    async verifyPhone(verifyPhoneDto) {
        const user = await this.prisma.user.findFirst({
            where: {
                phone: verifyPhoneDto.phone,
                phoneVerifyToken: verifyPhoneDto.code,
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid verification code');
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
    async socialLogin(socialLoginDto) {
        const socialUser = {
            id: 'mock_social_id',
            email: 'user@example.com',
            name: 'Social User',
            provider: socialLoginDto.provider,
        };
        let user = await this.prisma.user.findUnique({
            where: { email: socialUser.email },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: socialUser.email,
                    name: socialUser.name,
                    password: await bcrypt.hash(Math.random().toString(36), 12),
                    emailVerified: true,
                    socialProviders: JSON.stringify({ [socialUser.provider]: socialUser.id }),
                    avatar: socialUser.avatar,
                },
            });
        }
        else {
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
    async resendEmailVerification(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return { message: 'If email exists, verification link has been sent' };
        }
        if (user.emailVerified) {
            throw new common_1.BadRequestException('Email is already verified');
        }
        const emailVerifyToken = this.generateToken();
        await this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerifyToken },
        });
        console.log(`Email verification token for ${user.email}: ${emailVerifyToken}`);
        return { message: 'If email exists, verification link has been sent' };
    }
    generateToken() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
    generatePhoneCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    isAccountLocked(email) {
        const attempts = this.loginAttempts.get(email);
        if (!attempts)
            return false;
        const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
        if (timeSinceLastAttempt > this.lockoutDuration) {
            this.loginAttempts.delete(email);
            return false;
        }
        return attempts.count >= this.maxLoginAttempts;
    }
    recordFailedLogin(email) {
        const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: new Date() };
        attempts.count++;
        attempts.lastAttempt = new Date();
        this.loginAttempts.set(email, attempts);
    }
    clearFailedLogins(email) {
        this.loginAttempts.delete(email);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        guest_cart_service_1.GuestCartService,
        input_sanitizer_service_1.InputSanitizerService,
        secure_logger_service_1.SecureLoggerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map