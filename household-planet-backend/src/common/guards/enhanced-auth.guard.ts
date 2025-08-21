import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class EnhancedAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      
      // Enhanced security checks
      this.validateTokenSecurity(payload, request);
      
      request['user'] = payload;
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private validateTokenSecurity(payload: any, request: Request): void {
    // Check token age
    const tokenAge = Date.now() / 1000 - payload.iat;
    if (tokenAge > 7 * 24 * 60 * 60) { // 7 days
      throw new UnauthorizedException('Token too old, please re-authenticate');
    }

    // IP validation (optional - can be enabled for high-security endpoints)
    if (payload.ip && payload.ip !== request.ip) {
      // Log suspicious activity but don't block (IP can change legitimately)
      console.warn(`IP mismatch for user ${payload.userId}: token IP ${payload.ip}, request IP ${request.ip}`);
    }

    // User agent validation (basic check)
    if (payload.userAgent && payload.userAgent !== request.headers['user-agent']) {
      console.warn(`User agent mismatch for user ${payload.userId}`);
    }
  }
}