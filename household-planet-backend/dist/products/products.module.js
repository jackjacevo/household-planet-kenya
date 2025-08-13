"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const products_service_1 = require("./products.service");
const products_controller_1 = require("./products.controller");
const search_service_1 = require("./services/search.service");
const recommendations_service_1 = require("./services/recommendations.service");
const inventory_service_1 = require("./services/inventory.service");
const bulk_import_service_1 = require("./services/bulk-import.service");
const task_scheduler_service_1 = require("./services/task-scheduler.service");
const prisma_module_1 = require("../prisma/prisma.module");
let ProductsModule = class ProductsModule {
};
exports.ProductsModule = ProductsModule;
exports.ProductsModule = ProductsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, schedule_1.ScheduleModule.forRoot()],
        controllers: [products_controller_1.ProductsController],
        providers: [
            products_service_1.ProductsService,
            search_service_1.SearchService,
            recommendations_service_1.RecommendationsService,
            inventory_service_1.InventoryService,
            bulk_import_service_1.BulkImportService,
            task_scheduler_service_1.TaskSchedulerService
        ],
        exports: [products_service_1.ProductsService, recommendations_service_1.RecommendationsService, inventory_service_1.InventoryService]
    })
], ProductsModule);
//# sourceMappingURL=products.module.js.map