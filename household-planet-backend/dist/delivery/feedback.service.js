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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FeedbackService = class FeedbackService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async submitFeedback(orderId, rating, comment) {
        return this.prisma.deliveryFeedback.create({
            data: { orderId, rating, comment }
        });
    }
    async getFeedback(orderId) {
        return this.prisma.deliveryFeedback.findUnique({
            where: { orderId }
        });
    }
    async getAverageRating() {
        const result = await this.prisma.deliveryFeedback.aggregate({
            _avg: { rating: true },
            _count: { rating: true }
        });
        return {
            averageRating: result._avg.rating || 0,
            totalFeedbacks: result._count.rating
        };
    }
    async getFeedbackStats() {
        const ratings = await this.prisma.deliveryFeedback.groupBy({
            by: ['rating'],
            _count: { rating: true }
        });
        return ratings.map(r => ({
            rating: r.rating,
            count: r._count.rating
        }));
    }
};
exports.FeedbackService = FeedbackService;
exports.FeedbackService = FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeedbackService);
//# sourceMappingURL=feedback.service.js.map