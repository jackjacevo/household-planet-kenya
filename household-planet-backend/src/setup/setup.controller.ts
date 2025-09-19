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

    const email = 'admin@householdplanet.co.ke';
    const password = 'Admin@2025';
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await this.prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true,
        phone: '+254790227760'
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
        phone: '+254790227760'
      }
    });

    return { message: 'Admin created', email: admin.email };
  }
}