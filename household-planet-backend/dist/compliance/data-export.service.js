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
exports.DataExportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = require("fs");
const path = require("path");
let DataExportService = class DataExportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async exportUserData(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId.toString() },
            include: {
                orders: {
                    include: {
                        items: {
                            include: { product: true },
                        },
                        payments: true,
                    },
                },
                cart: {
                    include: {
                        product: true,
                    },
                },
                addresses: true,
                reviews: {
                    include: { product: true },
                },
            },
        });
        if (!user)
            throw new Error('User not found');
        const exportData = {
            personalData: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            addresses: user?.addresses || [],
            orders: user?.orders?.map(order => ({
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                total: order.total,
                createdAt: order.createdAt,
                items: order.items,
                payments: order.payments,
            })) || [],
            cart: user?.cart || [],
            reviews: user?.reviews || [],
            consents: await this.prisma.userConsent.findMany({
                where: { userId: userId.toString() },
            }),
            cookieConsents: await this.prisma.cookieConsent.findMany({
                where: { sessionId: user.id.toString() },
            }),
        };
        const fileName = `user_data_export_${userId}_${Date.now()}.json`;
        const filePath = path.join('./exports', fileName);
        if (!fs.existsSync('./exports')) {
            fs.mkdirSync('./exports', { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
        await this.prisma.dataExportRequest.create({
            data: {
                userId: userId.toString(),
                fileName,
                status: 'COMPLETED',
                requestedAt: new Date(),
                completedAt: new Date(),
            },
        });
        return { fileName, filePath, data: exportData };
    }
    async getExportHistory(userId) {
        return this.prisma.dataExportRequest.findMany({
            where: { userId: userId.toString() },
            orderBy: { requestedAt: 'desc' },
        });
    }
    async cleanupOldExports() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const oldExports = await this.prisma.dataExportRequest.findMany({
            where: {
                completedAt: { lt: thirtyDaysAgo },
            },
        });
        for (const exportRecord of oldExports) {
            const filePath = path.join('./exports', exportRecord.fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        await this.prisma.dataExportRequest.deleteMany({
            where: {
                completedAt: { lt: thirtyDaysAgo },
            },
        });
    }
};
exports.DataExportService = DataExportService;
exports.DataExportService = DataExportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DataExportService);
//# sourceMappingURL=data-export.service.js.map