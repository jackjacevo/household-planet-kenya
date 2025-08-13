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
    return this.prisma.$executeRaw`
      INSERT INTO admin_activity_log (id, user_id, action, details, created_at)
      VALUES (${this.generateId()}, ${userId}, ${action}, ${JSON.stringify(details)}, ${new Date()})
    `;
  }

  async getActivityLog(filters: any = {}) {
    let sql = `
      SELECT al.*, u.name as user_name, u.email as user_email
      FROM admin_activity_log al
      JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    
    if (filters.userId) sql += ` AND al.user_id = '${filters.userId}'`;
    if (filters.action) sql += ` AND al.action LIKE '%${filters.action}%'`;
    if (filters.dateFrom) sql += ` AND al.created_at >= '${filters.dateFrom}'`;
    if (filters.dateTo) sql += ` AND al.created_at <= '${filters.dateTo}'`;
    
    sql += ` ORDER BY al.created_at DESC LIMIT ${filters.limit || 100}`;
    
    return this.prisma.$queryRawUnsafe(sql);
  }

  private generateId(): string {
    return 'log_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}