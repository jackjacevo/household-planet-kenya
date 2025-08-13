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
exports.DeliveryController = void 0;
const common_1 = require("@nestjs/common");
const delivery_service_1 = require("./delivery.service");
const tracking_service_1 = require("./tracking.service");
const scheduling_service_1 = require("./scheduling.service");
const feedback_service_1 = require("./feedback.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let DeliveryController = class DeliveryController {
    constructor(deliveryService, trackingService, schedulingService, feedbackService) {
        this.deliveryService = deliveryService;
        this.trackingService = trackingService;
        this.schedulingService = schedulingService;
        this.feedbackService = feedbackService;
    }
    async initializeLocations() {
        await this.deliveryService.initializeLocations();
        return { message: 'Delivery locations initialized successfully' };
    }
    async getAllLocations() {
        return this.deliveryService.getAllLocations();
    }
    async getDeliveryPrice(location) {
        const price = await this.deliveryService.calculateDeliveryPrice(location);
        return { location, price };
    }
    async getLocationsByTier(tier) {
        return this.deliveryService.getLocationsByTier(parseInt(tier));
    }
    async getDeliveryEstimate(location) {
        return this.deliveryService.getDeliveryEstimate(location);
    }
    async getTracking(orderId) {
        return this.trackingService.getTracking(orderId);
    }
    async updateTracking(orderId, data) {
        return this.trackingService.updateStatus(orderId, data.status, data.location, data.notes);
    }
    async confirmDelivery(orderId, data) {
        return this.trackingService.confirmDelivery(orderId, data.photoProof);
    }
    async scheduleDelivery(orderId, data) {
        return this.schedulingService.scheduleDelivery(orderId, new Date(data.preferredDate), data.timeSlot, data.instructions);
    }
    async submitFeedback(orderId, data) {
        return this.feedbackService.submitFeedback(orderId, data.rating, data.comment);
    }
    async getFeedbackStats() {
        return this.feedbackService.getFeedbackStats();
    }
};
exports.DeliveryController = DeliveryController;
__decorate([
    (0, common_1.Post)('initialize'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "initializeLocations", null);
__decorate([
    (0, common_1.Get)('locations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "getAllLocations", null);
__decorate([
    (0, common_1.Get)('price'),
    __param(0, (0, common_1.Query)('location')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "getDeliveryPrice", null);
__decorate([
    (0, common_1.Get)('locations/tier'),
    __param(0, (0, common_1.Query)('tier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "getLocationsByTier", null);
__decorate([
    (0, common_1.Get)('estimate'),
    __param(0, (0, common_1.Query)('location')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "getDeliveryEstimate", null);
__decorate([
    (0, common_1.Get)('tracking/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "getTracking", null);
__decorate([
    (0, common_1.Post)('tracking/:orderId/update'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "updateTracking", null);
__decorate([
    (0, common_1.Post)('tracking/:orderId/confirm'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "confirmDelivery", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('schedule/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "scheduleDelivery", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('feedback/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "submitFeedback", null);
__decorate([
    (0, common_1.Get)('feedback/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeliveryController.prototype, "getFeedbackStats", null);
exports.DeliveryController = DeliveryController = __decorate([
    (0, common_1.Controller)('api/delivery'),
    __metadata("design:paramtypes", [delivery_service_1.DeliveryService,
        tracking_service_1.TrackingService,
        scheduling_service_1.SchedulingService,
        feedback_service_1.FeedbackService])
], DeliveryController);
//# sourceMappingURL=delivery.controller.js.map