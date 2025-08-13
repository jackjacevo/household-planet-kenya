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
exports.CustomerManagementController = void 0;
const common_1 = require("@nestjs/common");
const customer_management_service_1 = require("./customer-management.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let CustomerManagementController = class CustomerManagementController {
    constructor(customerManagementService) {
        this.customerManagementService = customerManagementService;
    }
    async getCustomers(filters) {
        return this.customerManagementService.getCustomers(filters);
    }
    async getCustomerStats() {
        return this.customerManagementService.getCustomerStats();
    }
    async getCustomerSegment(type) {
        return this.customerManagementService.segmentCustomers({ type });
    }
    async getCustomer(id) {
        return this.customerManagementService.getCustomerById(id);
    }
    async getCustomerInsights(id) {
        return this.customerManagementService.getCustomerInsights(id);
    }
    async getCommunicationLog(id) {
        return this.customerManagementService.getCustomerCommunicationLog(id);
    }
    async updateCustomer(id, data) {
        return this.customerManagementService.updateCustomer(id, data);
    }
    async addCustomerTag(id, data) {
        return this.customerManagementService.addCustomerTag(id, data.tag);
    }
    async removeCustomerTag(id, tag) {
        return this.customerManagementService.removeCustomerTag(id, tag);
    }
    async manageLoyaltyPoints(id, data) {
        return this.customerManagementService.manageLoyaltyPoints(id, data.points, data.type, data.description);
    }
    async createSupportTicket(id, data) {
        return this.customerManagementService.createSupportTicket(id, data);
    }
    async updateSupportTicket(ticketId, data) {
        return this.customerManagementService.updateSupportTicket(ticketId, data);
    }
    async addTicketReply(ticketId, data) {
        return this.customerManagementService.addTicketReply(ticketId, data.message, data.isStaff);
    }
    async verifyAddress(id, addressId) {
        return this.customerManagementService.verifyAddress(id, addressId);
    }
};
exports.CustomerManagementController = CustomerManagementController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "getCustomers", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "getCustomerStats", null);
__decorate([
    (0, common_1.Get)('segments/:type'),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "getCustomerSegment", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "getCustomer", null);
__decorate([
    (0, common_1.Get)(':id/insights'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "getCustomerInsights", null);
__decorate([
    (0, common_1.Get)(':id/communication-log'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "getCommunicationLog", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "updateCustomer", null);
__decorate([
    (0, common_1.Post)(':id/tags'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "addCustomerTag", null);
__decorate([
    (0, common_1.Delete)(':id/tags/:tag'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('tag')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "removeCustomerTag", null);
__decorate([
    (0, common_1.Post)(':id/loyalty'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "manageLoyaltyPoints", null);
__decorate([
    (0, common_1.Post)(':id/support-tickets'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "createSupportTicket", null);
__decorate([
    (0, common_1.Put)('support-tickets/:ticketId'),
    __param(0, (0, common_1.Param)('ticketId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "updateSupportTicket", null);
__decorate([
    (0, common_1.Post)('support-tickets/:ticketId/replies'),
    __param(0, (0, common_1.Param)('ticketId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "addTicketReply", null);
__decorate([
    (0, common_1.Post)(':id/addresses/:addressId/verify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('addressId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomerManagementController.prototype, "verifyAddress", null);
exports.CustomerManagementController = CustomerManagementController = __decorate([
    (0, common_1.Controller)('api/admin/customers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [customer_management_service_1.CustomerManagementService])
], CustomerManagementController);
//# sourceMappingURL=customer-management.controller.js.map