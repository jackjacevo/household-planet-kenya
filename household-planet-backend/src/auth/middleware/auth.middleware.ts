import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractTokenFromHeader(req);
    
    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        
        // Check if session is still active
        const session = await this.prisma.userSession.findFirst({
          where: {
            token,
            isActive: true,
            expiresAt: { gt: new Date() }
          },
          include: { user: true }
        });

        if (session) {
          // Update last used timestamp
          await this.prisma.userSession.update({
            where: { id: session.id },
            data: { lastUsedAt: new Date() }
          });

          req.user = session.user;
        }
      } catch (error) {
        // Token is invalid, but we don't throw error here
        // Let the guards handle authentication requirements
      }
    }

    next();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
