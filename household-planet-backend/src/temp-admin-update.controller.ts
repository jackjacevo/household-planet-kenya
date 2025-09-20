import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('temp')
export class TempAdminUpdateController {
  constructor(private prisma: PrismaService) {}

  @Post('update-admin-role')
  async updateAdminRole(@Body() body: { email: string; secretKey: string }) {
    // Security check
    if (body.secretKey !== 'temp-update-admin-2025') {
      throw new Error('Invalid secret key');
    }

    const user = await this.prisma.user.update({
      where: { email: body.email },
      data: { role: 'SUPER_ADMIN' },
    });

    return { message: 'Role updated successfully', user: { email: user.email, role: user.role } };
  }
}