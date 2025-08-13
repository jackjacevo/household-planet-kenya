"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryModule = void 0;
const common_1 = require("@nestjs/common");
const delivery_controller_1 = require("./delivery.controller");
const admin_controller_1 = require("./admin.controller");
const delivery_service_1 = require("./delivery.service");
const admin_service_1 = require("./admin.service");
const tracking_service_1 = require("./tracking.service");
const scheduling_service_1 = require("./scheduling.service");
const feedback_service_1 = require("./feedback.service");
const sms_service_1 = require("./sms.service");
const prisma_module_1 = require("../prisma/prisma.module");
let DeliveryModule = class DeliveryModule {
};
exports.DeliveryModule = DeliveryModule;
exports.DeliveryModule = DeliveryModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [delivery_controller_1.DeliveryController, admin_controller_1.AdminDeliveryController],
        providers: [delivery_service_1.DeliveryService, admin_service_1.AdminDeliveryService, tracking_service_1.TrackingService, scheduling_service_1.SchedulingService, feedback_service_1.FeedbackService, sms_service_1.SmsService],
        exports: [delivery_service_1.DeliveryService, tracking_service_1.TrackingService],
    })
], DeliveryModule);
//# sourceMappingURL=delivery.module.js.map