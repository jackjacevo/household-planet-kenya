import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerTagDto, UpdateCustomerProfileDto, CustomerCommunicationDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async getCustomerProfile(userId: number) {
    if (!userId || userId <= 0) {
      throw new Error('Invalid user ID');
    }
    return this.prisma.customerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            avatar: true,
            createdAt: true,
          },
        },
        tags: true,
        communications: {
          orderBy: { sentAt: 'desc' },
          take: 10,
        },
        loyaltyTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async createOrUpdateProfile(userId: number, data: UpdateCustomerProfileDto) {
    return this.prisma.customerProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  async getCustomerOrderHistory(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, images: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async addCustomerTag(profileId: number, tagDto: CreateCustomerTagDto) {
    return this.prisma.customerTag.create({
      data: { profileId, tag: tagDto.tag },
    });
  }

  async removeCustomerTag(profileId: number, tag: string) {
    return this.prisma.customerTag.delete({
      where: { profileId_tag: { profileId, tag } },
    });
  }

  async getCustomersBySegment(tags: string[], page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    return this.prisma.customerProfile.findMany({
      where: {
        tags: {
          some: {
            tag: { in: tags },
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            createdAt: true,
          },
        },
        tags: true,
      },
      skip,
      take: limit,
    });
  }

  async logCommunication(profileId: number, communicationDto: CustomerCommunicationDto) {
    return this.prisma.customerCommunication.create({
      data: {
        profileId,
        ...communicationDto,
      },
    });
  }

  async getCommunicationHistory(profileId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    return this.prisma.customerCommunication.findMany({
      where: { profileId },
      orderBy: { sentAt: 'desc' },
      skip,
      take: limit,
    });
  }

  async updateCustomerStats(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId, status: 'DELIVERED' },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null;

    return this.prisma.customerProfile.upsert({
      where: { userId },
      update: {
        totalSpent,
        totalOrders,
        averageOrderValue,
        lastOrderDate,
      },
      create: {
        userId,
        totalSpent,
        totalOrders,
        averageOrderValue,
        lastOrderDate,
      },
    });
  }

  async searchRealCustomers(query: string, page = 1, limit = 20) {
    const sanitizedQuery = query ? query.trim() : '';
    const skip = (page - 1) * limit;
    
    return this.prisma.user.findMany({
      where: {
        ...(sanitizedQuery && {
          OR: [
            { name: { contains: sanitizedQuery } },
            { email: { contains: sanitizedQuery } },
            { phone: { contains: sanitizedQuery } },
          ],
        }),
        role: 'CUSTOMER',
        email: { not: { endsWith: '@whatsapp.temp' } },
      },
      include: {
        customerProfile: {
          include: {
            tags: true,
          },
        },
        orders: {
          select: { id: true, total: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      skip,
      take: limit,
    });
  }

  async searchCustomers(query: string, page = 1, limit = 20) {
    const sanitizedQuery = query ? query.trim() : '';
    const skip = (page - 1) * limit;
    
    return this.prisma.user.findMany({
      where: {
        ...(sanitizedQuery && {
          OR: [
            { name: { contains: sanitizedQuery } },
            { email: { contains: sanitizedQuery } },
            { phone: { contains: sanitizedQuery } },
          ],
        }),
        role: 'CUSTOMER',
      },
      include: {
        customerProfile: {
          include: {
            tags: true,
          },
        },
        orders: {
          select: { id: true, total: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      skip,
      take: limit,
    });
  }

  async getCustomerDetails(userId: number) {
    // Update customer stats to ensure accuracy for detailed view
    await this.updateCustomerStats(userId);
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: {
          include: {
            tags: true,
            communications: {
              orderBy: { sentAt: 'desc' },
              take: 20,
            },
            loyaltyTransactions: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: { name: true, images: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        addresses: true,
        supportTickets: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return user;
  }

  async getCustomerAnalytics() {
    const [totalCustomers, newCustomersThisMonth, topSpenders, segmentStats] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      (() => {
        const now = new Date();
        return this.prisma.user.count({
          where: {
            role: 'CUSTOMER',
            createdAt: {
              gte: new Date(now.getFullYear(), now.getMonth(), 1),
            },
          },
        });
      })(),
      this.prisma.customerProfile.findMany({
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { totalSpent: 'desc' },
        take: 10,
      }),
      this.prisma.customerTag.groupBy({
        by: ['tag'],
        _count: { tag: true },
        orderBy: { _count: { tag: 'desc' } },
      }),
    ]);

    return {
      totalCustomers,
      newCustomersThisMonth,
      topSpenders,
      segmentStats,
    };
  }

  async bulkTagCustomers(customerIds: number[], tag: string) {
    const profiles = await this.prisma.customerProfile.findMany({
      where: { userId: { in: customerIds } },
      select: { id: true },
    });

    const profileIds = profiles.map(p => p.id);
    
    return this.prisma.customerTag.createMany({
      data: profileIds.map(profileId => ({ profileId, tag })),
    });
  }

  async getCustomerLifetimeValue(userId: number) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { createdAt: true },
        },
      },
    });

    if (!profile) return null;

    const daysSinceRegistration = Math.floor(
      (Date.now() - profile.user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const averageOrderFrequency = daysSinceRegistration > 0 
      ? profile.totalOrders / daysSinceRegistration * 30 // orders per month
      : 0;

    return {
      totalSpent: profile.totalSpent,
      totalOrders: profile.totalOrders,
      averageOrderValue: profile.averageOrderValue,
      daysSinceRegistration,
      averageOrderFrequency,
      estimatedLifetimeValue: Number(profile.averageOrderValue) * averageOrderFrequency * 12, // yearly estimate
    };
  }

  async deleteCustomer(userId: number) {
    return this.prisma.$transaction(async (prisma) => {
      // Get profile ID first
      const profile = await prisma.customerProfile.findUnique({
        where: { userId },
        select: { id: true }
      });
      
      if (profile) {
        // Delete related data first
        await prisma.customerTag.deleteMany({ where: { profileId: profile.id } });
        await prisma.customerCommunication.deleteMany({ where: { profileId: profile.id } });
        await prisma.loyaltyTransaction.deleteMany({ where: { profileId: profile.id } });
        await prisma.customerProfile.delete({ where: { userId } });
      }
      
      // Delete user
      return prisma.user.delete({ where: { id: userId } });
    });
  }

  async bulkDeleteCustomers(customerIds: number[]) {
    if (!customerIds || customerIds.length === 0) {
      throw new Error('No customer IDs provided');
    }

    return await this.prisma.$transaction(async (prisma) => {
      // Get profile IDs first
      const profiles = await prisma.customerProfile.findMany({
        where: { userId: { in: customerIds } },
        select: { id: true }
      });
      const profileIds = profiles.map(p => p.id);
      
      // Delete related data first (only if profiles exist)
      if (profileIds.length > 0) {
        await prisma.customerTag.deleteMany({ where: { profileId: { in: profileIds } } });
        await prisma.customerCommunication.deleteMany({ where: { profileId: { in: profileIds } } });
        await prisma.loyaltyTransaction.deleteMany({ where: { profileId: { in: profileIds } } });
        await prisma.customerProfile.deleteMany({ where: { userId: { in: customerIds } } });
      }
      
      // Delete users
      const result = await prisma.user.deleteMany({ where: { id: { in: customerIds }, role: 'CUSTOMER' } });
      return { deleted: result.count };
    });
  }
}