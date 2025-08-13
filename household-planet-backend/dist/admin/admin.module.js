"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const analytics_service_1 = require("./analytics.service");
const product_management_service_1 = require("./product-management.service");
const product_management_controller_1 = require("./product-management.controller");
const order_management_service_1 = require("./order-management.service");
const order_management_controller_1 = require("./order-management.controller");
const customer_management_service_1 = require("./customer-management.service");
const customer_management_controller_1 = require("./customer-management.controller");
const content_management_service_1 = require("./content-management.service");
const content_management_controller_1 = require("./content-management.controller");
const staff_management_service_1 = require("./staff-management.service");
const reporting_service_1 = require("./reporting.service");
const staff_reporting_controller_1 = require("./staff-reporting.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [admin_controller_1.AdminController, product_management_controller_1.ProductManagementController, product_management_controller_1.CategoryManagementController, order_management_controller_1.OrderManagementController, customer_management_controller_1.CustomerManagementController, content_management_controller_1.ContentManagementController, staff_reporting_controller_1.StaffReportingController],
        providers: [admin_service_1.AdminService, analytics_service_1.AnalyticsService, product_management_service_1.ProductManagementService, order_management_service_1.OrderManagementService, customer_management_service_1.CustomerManagementService, content_management_service_1.ContentManagementService, staff_management_service_1.StaffManagementService, reporting_service_1.ReportingService],
        exports: [admin_service_1.AdminService, analytics_service_1.AnalyticsService, product_management_service_1.ProductManagementService, order_management_service_1.OrderManagementService, customer_management_service_1.CustomerManagementService, content_management_service_1.ContentManagementService, staff_management_service_1.StaffManagementService, reporting_service_1.ReportingService]
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map