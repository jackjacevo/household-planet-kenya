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
exports.AbTestingController = void 0;
const common_1 = require("@nestjs/common");
const ab_testing_service_1 = require("./ab-testing.service");
const experiment_service_1 = require("./experiment.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let AbTestingController = class AbTestingController {
    constructor(abTestingService, experimentService) {
        this.abTestingService = abTestingService;
        this.experimentService = experimentService;
    }
    async getExperimentConfig(type, userId, sessionId) {
        return this.experimentService.getExperimentConfig(type, userId, sessionId);
    }
    async trackConversion(data) {
        return this.abTestingService.trackConversion({
            experimentId: data.experimentId,
            userId: data.userId,
            event: data.eventType,
            value: data.eventValue,
        });
    }
    async trackPurchase(data) {
        return this.experimentService.trackPurchase(data.experimentId, data.userId, data.sessionId, data.orderValue);
    }
    async trackAddToCart(data) {
        return this.experimentService.trackAddToCart(data.experimentId, data.userId, data.sessionId, data.productPrice);
    }
    async getAllExperiments() {
        return this.abTestingService.getAllExperiments();
    }
    async getActiveExperiments() {
        return this.abTestingService.getActiveExperiments();
    }
    async createExperiment(data) {
        return this.abTestingService.createExperiment(data);
    }
    async createButtonColorExperiment() {
        return this.experimentService.createButtonColorExperiment();
    }
    async createCheckoutLayoutExperiment() {
        return this.experimentService.createCheckoutLayoutExperiment();
    }
    async createPricingDisplayExperiment() {
        return this.experimentService.createPricingDisplayExperiment();
    }
    async createProductPageLayoutExperiment() {
        return this.experimentService.createProductPageLayoutExperiment();
    }
    async createContentExperiment() {
        return this.experimentService.createContentExperiment();
    }
    async getExperimentResults(experimentId) {
        return this.abTestingService.getExperimentResults(experimentId);
    }
    async getRecommendations(experimentId) {
        return this.experimentService.getRecommendations(experimentId);
    }
    async updateExperimentStatus(experimentId, data) {
        return this.abTestingService.updateExperimentStatus(experimentId, data.status);
    }
};
exports.AbTestingController = AbTestingController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('experiment/:type/config'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AbTestingController.prototype, "getExperimentConfig", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('track/conversion'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbTestingController.prototype, "trackConversion", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('track/purchase'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbTestingController.prototype, "trackPurchase", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('track/add-to-cart'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbTestingController.prototype, "trackAddToCart", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Get)('experiments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbTestingController.prototype, "getAllExperiments", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Get)('experiments/active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbTestingController.prototype, "getActiveExperiments", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Post)('experiments'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbTestingController.prototype, "createExperiment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Post)('experiments/templates/button-color'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbTestingController.prototype, "createButtonColorExperiment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Post)('experiments/templates/checkout-layout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbTestingController.prototype, "createCheckoutLayoutExperiment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Post)('experiments/templates/pricing-display'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbTestingController.prototype, "createPricingDisplayExperiment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Post)('experiments/templates/product-layout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbTestingController.prototype, "createProductPageLayoutExperiment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Post)('experiments/templates/hero-content'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AbTestingController.prototype, "createContentExperiment", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Get)('experiments/:id/results'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AbTestingController.prototype, "getExperimentResults", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Get)('experiments/:id/recommendations'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AbTestingController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.Post)('experiments/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AbTestingController.prototype, "updateExperimentStatus", null);
exports.AbTestingController = AbTestingController = __decorate([
    (0, common_1.Controller)('api/ab-testing'),
    __metadata("design:paramtypes", [ab_testing_service_1.AbTestingService,
        experiment_service_1.ExperimentService])
], AbTestingController);
//# sourceMappingURL=ab-testing.controller.js.map