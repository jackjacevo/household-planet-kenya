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
exports.TaskSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const recommendations_service_1 = require("./recommendations.service");
let TaskSchedulerService = class TaskSchedulerService {
    constructor(recommendationsService) {
        this.recommendationsService = recommendationsService;
    }
    async generateDailyRecommendations() {
        console.log('Generating product recommendations...');
        await this.recommendationsService.generateRecommendations();
        console.log('Product recommendations generated successfully');
    }
};
exports.TaskSchedulerService = TaskSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TaskSchedulerService.prototype, "generateDailyRecommendations", null);
exports.TaskSchedulerService = TaskSchedulerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [recommendations_service_1.RecommendationsService])
], TaskSchedulerService);
//# sourceMappingURL=task-scheduler.service.js.map