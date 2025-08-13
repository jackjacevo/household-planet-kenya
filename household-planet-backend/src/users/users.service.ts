import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, AddAddressDto } from './dto/update-profile.dto';
import { AddressType } from '../common/enums';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Check if phone is being updated and already exists
    if (updateProfileDto.phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { 
          phone: updateProfileDto.phone,
          NOT: { id: userId }
        },
      });
      if (existingPhone) {
        throw new BadRequestException('Phone number already exists');
      }
    }

    const updateData = {
      ...updateProfileDto,
      dateOfBirth: updateProfileDto.dateOfBirth ? new Date(updateProfileDto.dateOfBirth) : undefined,
    };

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        avatar: true,
        dateOfBirth: true,
        gender: true,
      },
    });

    return { user };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        addresses: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { user };
  }

  async addAddress(userId: string, addAddressDto: AddAddressDto) {
    if (addAddressDto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.address.create({
      data: {
        ...addAddressDto,
        userId,
      },
    });

    return { address };
  }

  async getAddresses(userId: string) {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });

    return { addresses };
  }

  async updateAddress(userId: string, addressId: string, updateAddressDto: AddAddressDto) {
    const existingAddress = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      throw new NotFoundException('Address not found');
    }

    if (updateAddressDto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.address.update({
      where: { id: addressId },
      data: updateAddressDto,
    });

    return { address };
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    return { message: 'Address deleted successfully' };
  }

  async verifyPhone(userId: string, token: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, phoneVerifyToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        phoneVerified: true,
        phoneVerifyToken: null,
      },
    });

    return { message: 'Phone verified successfully' };
  }

  async sendPhoneVerification(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.phone) {
      throw new NotFoundException('User or phone not found');
    }

    const phoneVerifyToken = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.user.update({
      where: { id: userId },
      data: { phoneVerifyToken },
    });

    // TODO: Send SMS via Africa's Talking
    console.log(`SMS verification code for ${user.phone}: ${phoneVerifyToken}`);

    return { message: 'Verification code sent to your phone' };
  }

  async getDashboardStats(userId: string) {
    const [user, orderStats, wishlistCount, recentOrders] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          loyaltyPoints: true,
          totalSpent: true,
          createdAt: true
        }
      }),
      this.prisma.order.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: { total: true }
      }),
      this.prisma.wishlist.count({ where: { userId } }),
      this.prisma.order.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true
        }
      })
    ]);

    return {
      loyaltyPoints: user?.loyaltyPoints || 0,
      totalSpent: user?.totalSpent || 0,
      totalOrders: orderStats._count.id,
      wishlistItems: wishlistCount,
      recentOrders,
      memberSince: user?.createdAt
    };
  }

  async updateSettings(userId: string, settings: {
    marketingEmails?: boolean;
    smsNotifications?: boolean;
    preferredLanguage?: string;
  }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: settings,
      select: {
        marketingEmails: true,
        smsNotifications: true,
        preferredLanguage: true
      }
    });
  }

  async getWishlist(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            slug: true,
            stock: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async addToWishlist(userId: string, productId: string) {
    return this.prisma.wishlist.upsert({
      where: {
        userId_productId: { userId, productId }
      },
      create: { userId, productId },
      update: {},
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            slug: true
          }
        }
      }
    });
  }

  async removeFromWishlist(userId: string, productId: string) {
    return this.prisma.wishlist.delete({
      where: {
        userId_productId: { userId, productId }
      }
    });
  }
}