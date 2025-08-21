import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async logActivity(userId: number, action: string, details: any, entityType?: string, entityId?: number) {
    return this.prisma.adminActivity.create({
      data: {
        userId,
        action,
        details: JSON.stringify(details),
        entityType,
        entityId,
        ipAddress: details.ipAddress || null,
        userAgent: details.userAgent || null
      }
    });
  }

  async getActivities(query: any) {
    const { page = 1, limit = 50, userId, action, entityType, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = parseInt(userId);
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (entityType) where.entityType = entityType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [activities, total] = await Promise.all([
      this.prisma.adminActivity.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      this.prisma.adminActivity.count({ where })
    ]);

    return {
      data: activities.map(activity => ({
        ...activity,
        details: JSON.parse(activity.details)
      })),
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getActivityStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalActivities,
      activitiesLast24h,
      activitiesLast7d,
      activitiesLast30d,
      topActions,
      activeUsers
    ] = await Promise.all([
      this.prisma.adminActivity.count(),
      this.prisma.adminActivity.count({ where: { createdAt: { gte: last24h } } }),
      this.prisma.adminActivity.count({ where: { createdAt: { gte: last7d } } }),
      this.prisma.adminActivity.count({ where: { createdAt: { gte: last30d } } }),
      this.prisma.adminActivity.groupBy({
        by: ['action'],
        _count: true,
        orderBy: { _count: { action: 'desc' } },
        take: 10
      }),
      this.prisma.adminActivity.groupBy({
        by: ['userId'],
        _count: true,
        where: { createdAt: { gte: last7d } },
        orderBy: { _count: { userId: 'desc' } },
        take: 10
      })
    ]);

    return {
      totalActivities,
      activitiesLast24h,
      activitiesLast7d,
      activitiesLast30d,
      topActions: topActions.map(item => ({
        action: item.action,
        count: item._count
      })),
      activeUsers: await this.enrichActiveUsers(activeUsers)
    };
  }

  private async enrichActiveUsers(activeUsers: any[]) {
    const userIds = activeUsers.map(item => item.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true }
    });

    return activeUsers.map(item => {
      const user = users.find(u => u.id === item.userId);
      return {
        user,
        activityCount: item._count
      };
    });
  }
}