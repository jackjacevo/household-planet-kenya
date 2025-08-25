import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { BUSINESS_CONSTANTS } from '../common/constants/business.constants';

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
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
        emailVerified: true,
        phoneVerified: true,
        notificationSettings: true,
        privacySettings: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateProfile(id: number, updateData: any) {
    try {
      console.log('Updating profile for user:', id, 'with data:', JSON.stringify(updateData, null, 2));
      
      // Check if user exists first
      const existingUser = await this.prisma.user.findUnique({
        where: { id }
      });
      
      if (!existingUser) {
        throw new BadRequestException('User not found');
      }
      
      // Filter out undefined, null, empty string values, and avatar (handled separately)
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([key, value]) => 
          key !== 'avatar' && value !== undefined && value !== null && value !== ''
        )
      );
      
      console.log('Filtered data:', JSON.stringify(filteredData, null, 2));
      
      // If no data to update, return current user
      if (Object.keys(filteredData).length === 0) {
        console.log('No data to update, returning current user');
        return this.findById(id);
      }
      
      // Update the user profile
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: filteredData,
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          avatar: true,
          dateOfBirth: true,
          gender: true,
          emailVerified: true,
          phoneVerified: true,
          notificationSettings: true,
          privacySettings: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      console.log('Profile updated successfully for user:', id);
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Profile update failed: ${error.message}`);
    }
  }

  async uploadAvatar(id: number, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
      
      try {
        await fs.promises.access(uploadDir);
      } catch {
        await fs.promises.mkdir(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const filename = `avatar-${id}-${Date.now()}.webp`;
      const filepath = path.resolve(uploadDir, filename);
      
      // Validate file path
      if (!filepath.startsWith(path.resolve(uploadDir))) {
        throw new BadRequestException('Invalid file path');
      }
      
      // Process and save image
      await sharp(file.buffer)
        .resize(200, 200, { fit: 'cover' })
        .webp({ quality: BUSINESS_CONSTANTS.FILE_UPLOAD.IMAGE_QUALITY })
        .toFile(filepath);
      
      const avatarUrl = `/uploads/avatars/${filename}`;
      
      // Update user avatar in database
      return this.update(id, { avatar: avatarUrl });
    } catch (error) {
      throw new BadRequestException(`Avatar upload failed: ${error.message}`);
    }
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