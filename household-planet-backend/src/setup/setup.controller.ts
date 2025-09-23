import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Controller('setup')
export class SetupController {
  constructor(private prisma: PrismaService) {}

  @Post('admin')
  async createAdmin(@Body() body: { secret: string }) {
    if (body.secret !== 'household-planet-setup-2025') {
      throw new Error('Invalid secret');
    }

    const email = 'admin@householdplanetkenya.co.ke';
    const password = 'Admin@2025';
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await this.prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        phone: '+254790227760',
        permissions: JSON.stringify([
          'admin:read', 'admin:write', 'admin:delete',
          'products:read', 'products:write', 'products:delete',
          'orders:read', 'orders:write', 'orders:delete',
          'users:read', 'users:write', 'users:delete',
          'categories:read', 'categories:write', 'categories:delete',
          'settings:read', 'settings:write'
        ])
      },
      create: {
        email,
        password: hashedPassword,
        name: 'Admin User',
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        phone: '+254790227760',
        permissions: JSON.stringify([
          'admin:read', 'admin:write', 'admin:delete',
          'products:read', 'products:write', 'products:delete',
          'orders:read', 'orders:write', 'orders:delete',
          'users:read', 'users:write', 'users:delete',
          'categories:read', 'categories:write', 'categories:delete',
          'settings:read', 'settings:write'
        ])
      }
    });

    return { message: 'Admin created with full permissions', email: admin.email, role: admin.role };
  }
}