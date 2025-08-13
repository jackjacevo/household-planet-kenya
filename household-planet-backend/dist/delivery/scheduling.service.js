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
exports.SchedulingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SchedulingService = class SchedulingService {
    constructor(prisma) {
        this.prisma = prisma;
        this.timeSlots = [
            '9:00 AM - 12:00 PM',
            '12:00 PM - 3:00 PM',
            '3:00 PM - 6:00 PM',
            '6:00 PM - 9:00 PM'
        ];
    }
    async scheduleDelivery(orderId, preferredDate, timeSlot, instructions) {
        if (!this.timeSlots.includes(timeSlot)) {
            throw new common_1.BadRequestException('Invalid time slot');
        }
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (preferredDate < tomorrow) {
            throw new common_1.BadRequestException('Delivery date must be at least tomorrow');
        }
        return this.prisma.deliverySchedule.create({
            data: { orderId, preferredDate, timeSlot, instructions }
        });
    }
    async rescheduleDelivery(orderId, newDate, newTimeSlot) {
        return this.prisma.deliverySchedule.update({
            where: { orderId },
            data: {
                preferredDate: newDate,
                timeSlot: newTimeSlot,
                isRescheduled: true
            }
        });
    }
    async getAvailableSlots(date) {
        return this.timeSlots;
    }
    async getSchedule(orderId) {
        return this.prisma.deliverySchedule.findUnique({
            where: { orderId }
        });
    }
};
exports.SchedulingService = SchedulingService;
exports.SchedulingService = SchedulingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchedulingService);
//# sourceMappingURL=scheduling.service.js.map