import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffManagementService {
  constructor(private prisma: PrismaService) {}

  async getStaffMembers() {
    return this.prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'STAFF', 'MANAGER'] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createStaffMember(data: any) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password, // Should be hashed
        role: data.role,
        isActive: true
      }
    });
  }

  async updateStaffRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role }
    });
  }

  async deactivateStaff(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });
  }

  async getStaffPermissions(role: string) {
    const permissions = {
      'ADMIN': ['all'],
      'MANAGER': ['orders', 'customers', 'products', 'reports'],
      'STAFF': ['orders', 'customers']
    };
    return permissions[role] || [];
  }

  async logActivity(userId: string, action: string, details: any) {
    return this.prisma.auditLog.create({
      data: {
        action,
        details: JSON.stringify(details),
        userId,
        timestamp: new Date()
      }
    });
  }

  async getActivityLog(filters: any = {}) {
    const where: any = {};
    
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = { contains: filters.action };
    if (filters.dateFrom || filters.dateTo) {
      where.timestamp = {};
      if (filters.dateFrom) where.timestamp.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.timestamp.lte = new Date(filters.dateTo);
    }
    
    return this.prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filters.limit || 100
    });
  }

  private generateId(): string {
    return 'log_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}