import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
      passReqToCallback: true,
    });
    
    if (!configService.get<string>('JWT_SECRET')) {
      console.warn('JWT_SECRET not found in environment variables, using fallback');
    }
  }

  async validate(req: any, payload: any) {
    // Extract token from request
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    
    // Verify session is still active
    const session = await this.prisma.userSession.findFirst({
      where: {
        token,
        userId: payload.sub,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
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
            isActive: true,
            permissions: true,
          }
        }
      }
    });

    if (!session || !session.user || !session.user.isActive) {
      throw new UnauthorizedException('Session expired or user deactivated');
    }

    // Update last used timestamp
    try {
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: { lastUsedAt: new Date() }
      });
    } catch (error) {
      // Log but don't fail the request if session update fails
      console.warn('Failed to update session timestamp:', error);
    }

    return {
      id: session.user.id,
      email: session.user.email,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      name: session.user.name,
      role: session.user.role,
      emailVerified: session.user.emailVerified,
      phoneVerified: session.user.phoneVerified,
      twoFactorEnabled: session.user.twoFactorEnabled,
      permissions: session.user.permissions ? JSON.parse(session.user.permissions) : [],
    };
  }
}