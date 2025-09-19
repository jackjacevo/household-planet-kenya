import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async logActivity(userId: number, action: string, details: any, entityType?: string, entityId?: number, ipAddress?: string, userAgent?: string) {
    try {
      return this.prisma.adminActivity.create({
        data: {
          userId,
          action,
          details: typeof details === 'string' ? details : JSON.stringify(details),
          entityType,
          entityId,
          ipAddress: ipAddress || details?.ipAddress || null,
          userAgent: userAgent || details?.userAgent || null
        }
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  async getActivities(query: any) {
    try {
      const { page = 1, limit = 50, userId, action, search, entityType, startDate, endDate } = query;
      const skip = (page - 1) * parseInt(limit);

      const where: any = {};
      
      if (userId) where.userId = parseInt(userId);
      if (action) where.action = { contains: action };
      if (search) {
        console.log('Search term:', search);
        where.OR = [
          { action: { contains: search } },
          { user: { name: { contains: search } } }
        ];
        console.log('Where clause:', JSON.stringify(where, null, 2));
      }
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
        data: activities.map(activity => {
          let parsedDetails;
          try {
            parsedDetails = JSON.parse(activity.details);
          } catch {
            parsedDetails = activity.details;
          }
          return {
            ...activity,
            details: parsedDetails
          };
        }),
        meta: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      console.error('Error fetching activities:', error);
      return {
        data: [],
        meta: {
          total: 0,
          page: parseInt(query.page || 1),
          limit: parseInt(query.limit || 50),
          totalPages: 0
        }
      };
    }
  }

  async getActivityStats() {
    try {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalActivities,
        activitiesLast24h,
        activitiesLast7d,
        activitiesLast30d
      ] = await Promise.all([
        this.prisma.adminActivity.count(),
        this.prisma.adminActivity.count({ where: { createdAt: { gte: last24h } } }),
        this.prisma.adminActivity.count({ where: { createdAt: { gte: last7d } } }),
        this.prisma.adminActivity.count({ where: { createdAt: { gte: last30d } } })
      ]);

      // Get top actions with a simpler approach
      const topActionsRaw = await this.prisma.$queryRaw`
        SELECT action, COUNT(*) as count
        FROM admin_activities
        GROUP BY action
        ORDER BY count DESC
        LIMIT 10
      `;

      const topActions = (topActionsRaw as any[]).map(item => ({
        action: item.action,
        count: Number(item.count)
      }));

      // Get active users with a simpler approach
      const activeUsersRaw = await this.prisma.$queryRaw`
        SELECT userId, COUNT(*) as count
        FROM admin_activities
        WHERE createdAt >= ${last7d.toISOString()}
        GROUP BY userId
        ORDER BY count DESC
        LIMIT 10
      `;

      const activeUsers = await this.enrichActiveUsers(
        (activeUsersRaw as any[]).map(item => ({
          userId: item.userId,
          _count: Number(item.count)
        }))
      );

      return {
        totalActivities,
        activitiesLast24h,
        activitiesLast7d,
        activitiesLast30d,
        topActions,
        activeUsers
      };
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      return {
        totalActivities: 0,
        activitiesLast24h: 0,
        activitiesLast7d: 0,
        activitiesLast30d: 0,
        topActions: [],
        activeUsers: []
      };
    }
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
