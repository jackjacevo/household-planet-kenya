import { Module, MiddlewareConsumer, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SmsService } from './services/sms.service';
import { SocialAuthService } from './services/social-auth.service';
import { AuthMiddleware } from './middleware/auth.middleware';
import { RolesGuard } from './guards/roles.guard';
import { EmailVerifiedGuard } from './guards/email-verified.guard';
import { PhoneVerifiedGuard } from './guards/phone-verified.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => ActivityModule),
    PassportModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    SmsService,
    SocialAuthService,
    RolesGuard,
    EmailVerifiedGuard,
    PhoneVerifiedGuard,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    SmsService,
    SocialAuthService,
    RolesGuard,
    EmailVerifiedGuard,
    PhoneVerifiedGuard,
  ],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*');
  }
}