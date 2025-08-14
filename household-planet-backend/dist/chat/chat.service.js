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
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatService = ChatService_1 = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ChatService_1.name);
    }
    async createChatSession(visitorId, userAgent, ipAddress) {
        return this.prisma.chatSession.create({
            data: {
                visitorId,
                userAgent,
                status: 'ACTIVE',
            },
        });
    }
    async sendMessage(sessionId, message, isFromCustomer, userId) {
        const chatMessage = await this.prisma.chatMessage.create({
            data: {
                sessionId,
                sender: isFromCustomer ? 'customer' : 'agent',
                message,
                isFromCustomer,
            },
        });
        await this.prisma.chatSession.update({
            where: { id: sessionId },
            data: { lastActivityAt: new Date() },
        });
        return chatMessage;
    }
    async getChatHistory(sessionId) {
        return this.prisma.chatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
            include: {
                user: {
                    select: { name: true, role: true },
                },
            },
        });
    }
    async getActiveSessions() {
        return this.prisma.chatSession.findMany({
            where: {
                status: 'ACTIVE',
                lastActivityAt: {
                    gte: new Date(Date.now() - 30 * 60 * 1000),
                },
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
                _count: {
                    select: { messages: true },
                },
            },
        });
    }
    async assignSession(sessionId, userId) {
        return this.prisma.chatSession.update({
            where: { id: sessionId },
            data: { assignedTo: userId },
        });
    }
    async closeSession(sessionId) {
        return this.prisma.chatSession.update({
            where: { id: sessionId },
            data: {
                status: 'CLOSED',
                closedAt: new Date(),
            },
        });
    }
    async saveOfflineMessage(name, email, message) {
        return this.prisma.offlineMessage.create({
            data: { name, email, message },
        });
    }
    async findAutoResponse(message) {
        const responses = await this.prisma.chatAutoResponse.findMany({
            where: { isActive: true },
            orderBy: { priority: 'asc' },
        });
        for (const response of responses) {
            const keywords = response.keywords.toLowerCase().split(',');
            const messageText = message.toLowerCase();
            if (keywords.some(keyword => messageText.includes(keyword.trim()))) {
                return response.response;
            }
        }
        return null;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map