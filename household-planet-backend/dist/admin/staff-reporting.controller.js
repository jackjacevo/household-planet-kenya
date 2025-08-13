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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffReportingController = void 0;
const common_1 = require("@nestjs/common");
const staff_management_service_1 = require("./staff-management.service");
const reporting_service_1 = require("./reporting.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let StaffReportingController = class StaffReportingController {
    constructor(staffManagementService, reportingService) {
        this.staffManagementService = staffManagementService;
        this.reportingService = reportingService;
    }
    async getStaffMembers() {
        return this.staffManagementService.getStaffMembers();
    }
    async createStaffMember(data, user) {
        const result = await this.staffManagementService.createStaffMember(data);
        await this.staffManagementService.logActivity(user.id, 'CREATE_STAFF', { staffId: result.id, role: data.role });
        return result;
    }
    async updateStaffRole(id, data, user) {
        const result = await this.staffManagementService.updateStaffRole(id, data.role);
        await this.staffManagementService.logActivity(user.id, 'UPDATE_STAFF_ROLE', { staffId: id, newRole: data.role });
        return result;
    }
    async deactivateStaff(id, user) {
        const result = await this.staffManagementService.deactivateStaff(id);
        await this.staffManagementService.logActivity(user.id, 'DEACTIVATE_STAFF', { staffId: id });
        return result;
    }
    async getStaffPermissions(role) {
        return this.staffManagementService.getStaffPermissions(role);
    }
    async getActivityLog(filters) {
        return this.staffManagementService.getActivityLog(filters);
    }
    async logActivity(data, user) {
        return this.staffManagementService.logActivity(user.id, data.action, data.details);
    }
    async getSalesReport(startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.reportingService.generateSalesReport(start, end);
    }
    async getCustomerReport() {
        return this.reportingService.generateCustomerReport();
    }
    async getInventoryReport() {
        return this.reportingService.generateInventoryReport();
    }
    async getFinancialReport(startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        return this.reportingService.generateFinancialReport(start, end);
    }
};
exports.StaffReportingController = StaffReportingController;
__decorate([
    (0, common_1.Get)('staff'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StaffReportingController.prototype, "getStaffMembers", null);
__decorate([
    (0, common_1.Post)('staff'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StaffReportingController.prototype, "createStaffMember", null);
__decorate([
    (0, common_1.Put)('staff/:id/role'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], StaffReportingController.prototype, "updateStaffRole", null);
__decorate([
    (0, common_1.Put)('staff/:id/deactivate'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StaffReportingController.prototype, "deactivateStaff", null);
__decorate([
    (0, common_1.Get)('staff/permissions/:role'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.STAFF),
    __param(0, (0, common_1.Param)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StaffReportingController.prototype, "getStaffPermissions", null);
__decorate([
    (0, common_1.Get)('activity-log'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffReportingController.prototype, "getActivityLog", null);
__decorate([
    (0, common_1.Post)('activity-log'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StaffReportingController.prototype, "logActivity", null);
__decorate([
    (0, common_1.Get)('reports/sales'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.STAFF),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StaffReportingController.prototype, "getSalesReport", null);
__decorate([
    (0, common_1.Get)('reports/customers'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.STAFF),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StaffReportingController.prototype, "getCustomerReport", null);
__decorate([
    (0, common_1.Get)('reports/inventory'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.STAFF),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StaffReportingController.prototype, "getInventoryReport", null);
__decorate([
    (0, common_1.Get)('reports/financial'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StaffReportingController.prototype, "getFinancialReport", null);
exports.StaffReportingController = StaffReportingController = __decorate([
    (0, common_1.Controller)('api/admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [staff_management_service_1.StaffManagementService,
        reporting_service_1.ReportingService])
], StaffReportingController);
//# sourceMappingURL=staff-reporting.controller.js.map