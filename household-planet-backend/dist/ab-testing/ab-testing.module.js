"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbTestingModule = void 0;
const common_1 = require("@nestjs/common");
const ab_testing_controller_1 = require("./ab-testing.controller");
const ab_testing_service_1 = require("./ab-testing.service");
const experiment_service_1 = require("./experiment.service");
const prisma_module_1 = require("../prisma/prisma.module");
let AbTestingModule = class AbTestingModule {
};
exports.AbTestingModule = AbTestingModule;
exports.AbTestingModule = AbTestingModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [ab_testing_controller_1.AbTestingController],
        providers: [ab_testing_service_1.AbTestingService, experiment_service_1.ExperimentService],
        exports: [ab_testing_service_1.AbTestingService, experiment_service_1.ExperimentService],
    })
], AbTestingModule);
//# sourceMappingURL=ab-testing.module.js.map