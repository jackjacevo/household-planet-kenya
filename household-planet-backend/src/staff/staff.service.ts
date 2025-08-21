import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async getAllStaff() {
    return this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'STAFF'] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
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
  }

  async createStaff(createStaffDto: CreateStaffDto) {
    const hashedPassword = await bcrypt.hash(createStaffDto.password, 10);
    
    return this.prisma.user.create({
      data: {
        ...createStaffDto,
        password: hashedPassword,
        role: createStaffDto.role || 'STAFF',
        permissions: createStaffDto.permissions ? JSON.stringify(createStaffDto.permissions) : null
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
      updateData.password = await bcrypt.hash(updateStaffDto.password, 10);
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