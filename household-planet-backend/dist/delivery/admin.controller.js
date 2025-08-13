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
exports.AdminDeliveryController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let AdminDeliveryController = class AdminDeliveryController {
    constructor(adminDeliveryService) {
        this.adminDeliveryService = adminDeliveryService;
    }
    async getDashboard() {
        return this.adminDeliveryService.getDeliveryDashboard();
    }
    async getAnalytics(days) {
        return this.adminDeliveryService.getDeliveryAnalytics(days ? parseInt(days) : 30);
    }
    async getFailedDeliveries() {
        return this.adminDeliveryService.getFailedDeliveries();
    }
    async bulkUpdateStatus(data) {
        return this.adminDeliveryService.bulkUpdateStatus(data.orderIds, data.status, data.notes);
    }
};
exports.AdminDeliveryController = AdminDeliveryController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDeliveryController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('analytics'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminDeliveryController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminDeliveryController.prototype, "getFailedDeliveries", null);
__decorate([
    (0, common_1.Post)('bulk-update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminDeliveryController.prototype, "bulkUpdateStatus", null);
exports.AdminDeliveryController = AdminDeliveryController = __decorate([
    (0, common_1.Controller)('api/admin/delivery'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [admin_service_1.AdminDeliveryService])
], AdminDeliveryController);
//# sourceMappingURL=admin.controller.js.map