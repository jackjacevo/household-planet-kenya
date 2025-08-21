import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: any) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: any) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async findById(id: number) {
    return this.findOne(id);
  }

  async updateProfile(id: number, updateData: any) {
    return this.update(id, updateData);
  }

  async uploadAvatar(id: number, file: any) {
    return this.update(id, { avatar: file.filename });
  }

  async changePassword(id: number, changePasswordDto: any) {
    return this.update(id, { password: changePasswordDto.newPassword });
  }

  async updateNotificationSettings(id: number, settings: any) {
    return this.update(id, { notificationSettings: JSON.stringify(settings) });
  }

  async updatePrivacySettings(id: number, settings: any) {
    return this.update(id, { privacySettings: JSON.stringify(settings) });
  }

  async deleteAccount(id: number) {
    return this.remove(id);
  }

  async getDashboardStats(id: number) {
    return { orders: 0, totalSpent: 0, points: 0 };
  }

  async getAddresses(id: number) {
    return this.prisma.address.findMany({ where: { userId: id } });
  }

  async createAddress(id: number, addressData: any) {
    return this.prisma.address.create({ data: { ...addressData, userId: id } });
  }

  async updateAddress(userId: number, id: number, addressData: any) {
    return this.prisma.address.update({ where: { id, userId }, data: addressData });
  }

  async deleteAddress(userId: number, id: number) {
    return this.prisma.address.delete({ where: { id, userId } });
  }

  async setDefaultAddress(userId: number, id: number) {
    await this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return this.prisma.address.update({ where: { id, userId }, data: { isDefault: true } });
  }
}