"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StaffManagementService = class StaffManagementService {
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async createStaffMember(data) {
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                isActive: true
            }
        });
    }
    async updateStaffRole(userId, role) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { role }
        });
    }
    async deactivateStaff(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { isActive: false }
        });
    }
    async getStaffPermissions(role) {
        const permissions = {
            'ADMIN': ['all'],
            'MANAGER': ['orders', 'customers', 'products', 'reports'],
            'STAFF': ['orders', 'customers']
        };
        return permissions[role] || [];
    }
    async logActivity(userId, action, details) {
        return this.prisma.$executeRaw `
      INSERT INTO admin_activity_log (id, user_id, action, details, created_at)
      VALUES (${this.generateId()}, ${userId}, ${action}, ${JSON.stringify(details)}, ${new Date()})
    `;
    }
    async getActivityLog(filters = {}) {
        let sql = `
      SELECT al.*, u.name as user_name, u.email as user_email
      FROM admin_activity_log al
      JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
        if (filters.userId)
            sql += ` AND al.user_id = '${filters.userId}'`;
        if (filters.action)
            sql += ` AND al.action LIKE '%${filters.action}%'`;
        if (filters.dateFrom)
            sql += ` AND al.created_at >= '${filters.dateFrom}'`;
        if (filters.dateTo)
            sql += ` AND al.created_at <= '${filters.dateTo}'`;
        sql += ` ORDER BY al.created_at DESC LIMIT ${filters.limit || 100}`;
        return this.prisma.$queryRawUnsafe(sql);
    }
    generateId() {
        return 'log_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};
exports.StaffManagementService = StaffManagementService;
exports.StaffManagementService = StaffManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StaffManagementService);
//# sourceMappingURL=staff-management.service.js.map