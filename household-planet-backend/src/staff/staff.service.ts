import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async getAllStaff() {
    const staff = await this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'STAFF'] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        permissions: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return staff.map(member => ({
      ...member,
      permissions: member.permissions ? JSON.parse(member.permissions) : [],
      _count: {
        orders: member._count?.orders || 0
      }
    }));
  }

  async createStaff(createStaffDto: CreateStaffDto) {
    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createStaffDto.email }
    });
    
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createStaffDto.password, 12);
    
    return this.prisma.user.create({
      data: {
        name: createStaffDto.name,
        email: createStaffDto.email,
        password: hashedPassword,
        role: createStaffDto.role || 'STAFF',
        permissions: createStaffDto.permissions ? JSON.stringify(createStaffDto.permissions) : null,
        isActive: createStaffDto.isActive !== undefined ? createStaffDto.isActive : true,
        emailVerified: true // Staff accounts are pre-verified
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
  }

  async updateStaff(id: number, updateStaffDto: UpdateStaffDto) {
    const staff = await this.prisma.user.findUnique({ where: { id } });
    if (!staff) throw new NotFoundException('Staff member not found');

    const updateData: any = { ...updateStaffDto };
    if (updateStaffDto.password) {
      updateData.password = await bcrypt.hash(updateStaffDto.password, 12);
    }
    if (updateStaffDto.permissions) {
      updateData.permissions = JSON.stringify(updateStaffDto.permissions);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        permissions: true,
        updatedAt: true
      }
    });
  }

  async deleteStaff(id: number) {
    const staff = await this.prisma.user.findUnique({ where: { id } });
    if (!staff) throw new NotFoundException('Staff member not found');

    return this.prisma.user.delete({ where: { id } });
  }

  async updatePermissions(id: number, permissions: string[]) {
    const staff = await this.prisma.user.findUnique({ where: { id } });
    if (!staff) throw new NotFoundException('Staff member not found');

    return this.prisma.user.update({
      where: { id },
      data: { permissions: JSON.stringify(permissions) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
  }
}
