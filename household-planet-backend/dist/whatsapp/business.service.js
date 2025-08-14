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
var WhatsAppBusinessService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppBusinessService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const whatsapp_service_1 = require("./whatsapp.service");
const template_service_1 = require("./template.service");
let WhatsAppBusinessService = WhatsAppBusinessService_1 = class WhatsAppBusinessService {
    constructor(prisma, whatsappService, templateService) {
        this.prisma = prisma;
        this.whatsappService = whatsappService;
        this.templateService = templateService;
        this.logger = new common_1.Logger(WhatsAppBusinessService_1.name);
    }
    async setBusinessHours(hours) {
        await this.prisma.whatsAppBusinessSettings.upsert({
            where: { id: 'default' },
            update: { businessHours: JSON.stringify(hours) },
            create: { id: 'default', businessHours: JSON.stringify(hours) },
        });
    }
    async getBusinessHours() {
        const settings = await this.prisma.whatsAppBusinessSettings.findFirst();
        return settings?.businessHours ? JSON.parse(settings.businessHours) : null;
    }
    async isBusinessOpen() {
        const hours = await this.getBusinessHours();
        if (!hours)
            return true;
        const now = new Date();
        const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const currentTime = now.toTimeString().slice(0, 5);
        const todayHours = hours[dayName];
        if (!todayHours || !todayHours.isOpen)
            return false;
        return currentTime >= todayHours.open && currentTime <= todayHours.close;
    }
    async setAutoReply(type, message) {
        await this.prisma.whatsAppAutoReply.upsert({
            where: { type },
            update: { message, isActive: true },
            create: { type, message, isActive: true },
        });
    }
    async getAutoReply(type) {
        return this.prisma.whatsAppAutoReply.findUnique({
            where: { type },
        });
    }
    async sendAutoReply(phoneNumber, type) {
        const autoReply = await this.getAutoReply(type);
        if (autoReply && autoReply.isActive) {
            return this.whatsappService.sendMessage(phoneNumber, autoReply.message, 'AUTO_REPLY');
        }
        return false;
    }
    async createCustomerSegment(name, criteria) {
        return this.prisma.whatsAppCustomerSegment.create({
            data: {
                name,
                criteria: JSON.stringify(criteria),
            },
        });
    }
    async getCustomersInSegment(segmentId) {
        const segment = await this.prisma.whatsAppCustomerSegment.findUnique({
            where: { id: segmentId },
        });
        if (!segment)
            return [];
        const criteria = JSON.parse(segment.criteria);
        const whereClause = {};
        if (criteria.totalOrders) {
            whereClause.orders = {
                _count: {
                    gte: criteria.totalOrders.min || 0,
                    lte: criteria.totalOrders.max || 999999,
                },
            };
        }
        if (criteria.hasWhatsApp) {
            whereClause.phoneNumber = { not: null };
        }
        return this.prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                _count: {
                    select: { orders: true },
                },
            },
        });
    }
    async createBroadcastCampaign(data) {
        const campaign = await this.prisma.whatsAppCampaign.create({
            data: {
                name: data.name,
                message: data.message,
                segmentId: data.segmentId,
                phoneNumbers: data.phoneNumbers ? JSON.stringify(data.phoneNumbers) : null,
                scheduledAt: data.scheduledAt,
                mediaUrl: data.mediaUrl,
                status: data.scheduledAt ? 'SCHEDULED' : 'DRAFT',
            },
        });
        if (!data.scheduledAt) {
            await this.executeCampaign(campaign.id);
        }
        return campaign;
    }
    async executeCampaign(campaignId) {
        const campaign = await this.prisma.whatsAppCampaign.findUnique({
            where: { id: campaignId },
        });
        if (!campaign)
            throw new Error('Campaign not found');
        let phoneNumbers = [];
        if (campaign.segmentId) {
            const customers = await this.getCustomersInSegment(campaign.segmentId);
            phoneNumbers = customers
                .filter(c => c.phoneNumber)
                .map(c => c.phoneNumber);
        }
        else if (campaign.phoneNumbers) {
            phoneNumbers = JSON.parse(campaign.phoneNumbers);
        }
        await this.prisma.whatsAppCampaign.update({
            where: { id: campaignId },
            data: {
                status: 'SENDING',
                sentAt: new Date(),
                totalRecipients: phoneNumbers.length,
            },
        });
        let successCount = 0;
        let failureCount = 0;
        for (const phoneNumber of phoneNumbers) {
            try {
                const success = await this.whatsappService.sendMessage(phoneNumber, campaign.message, 'CAMPAIGN', null, null, campaign.mediaUrl || undefined);
                if (success) {
                    successCount++;
                }
                else {
                    failureCount++;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {
                failureCount++;
                this.logger.error(`Failed to send campaign message to ${phoneNumber}:`, error);
            }
        }
        await this.prisma.whatsAppCampaign.update({
            where: { id: campaignId },
            data: {
                status: 'COMPLETED',
                successfulSends: successCount,
                failedSends: failureCount,
                completedAt: new Date(),
            },
        });
        return { successCount, failureCount, total: phoneNumbers.length };
    }
    async addContact(phoneNumber, name, userId) {
        return this.prisma.whatsAppContact.upsert({
            where: { phoneNumber },
            update: {
                name: name || undefined,
                userId: userId || undefined,
                updatedAt: new Date(),
            },
            create: {
                phoneNumber,
                name,
                userId,
                isOptedIn: true,
            },
        });
    }
    async optOutContact(phoneNumber) {
        return this.prisma.whatsAppContact.update({
            where: { phoneNumber },
            data: {
                isOptedIn: false,
                optedOutAt: new Date(),
            },
        });
    }
    async optInContact(phoneNumber) {
        return this.prisma.whatsAppContact.update({
            where: { phoneNumber },
            data: {
                isOptedIn: true,
                optedOutAt: null,
            },
        });
    }
    async getOptedInContacts() {
        return this.prisma.whatsAppContact.findMany({
            where: { isOptedIn: true },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async getCampaignAnalytics(campaignId) {
        const campaign = await this.prisma.whatsAppCampaign.findUnique({
            where: { id: campaignId },
        });
        if (!campaign)
            return null;
        const messages = await this.prisma.whatsAppMessage.findMany({
            where: {
                type: 'CAMPAIGN',
                createdAt: {
                    gte: campaign.sentAt || campaign.createdAt,
                    lte: campaign.completedAt || new Date(),
                },
            },
        });
        return {
            campaign,
            totalSent: messages.filter(m => m.status === 'SENT').length,
            totalFailed: messages.filter(m => m.status === 'FAILED').length,
            deliveryRate: campaign.totalRecipients ?
                (campaign.successfulSends / campaign.totalRecipients) * 100 : 0,
        };
    }
    async getBusinessAnalytics(startDate, endDate) {
        const [totalMessages, sentMessages, failedMessages, campaigns, contacts, optedOutContacts,] = await Promise.all([
            this.prisma.whatsAppMessage.count({
                where: {
                    createdAt: { gte: startDate, lte: endDate },
                },
            }),
            this.prisma.whatsAppMessage.count({
                where: {
                    status: 'SENT',
                    createdAt: { gte: startDate, lte: endDate },
                },
            }),
            this.prisma.whatsAppMessage.count({
                where: {
                    status: 'FAILED',
                    createdAt: { gte: startDate, lte: endDate },
                },
            }),
            this.prisma.whatsAppCampaign.count({
                where: {
                    createdAt: { gte: startDate, lte: endDate },
                },
            }),
            this.prisma.whatsAppContact.count({
                where: { isOptedIn: true },
            }),
            this.prisma.whatsAppContact.count({
                where: { isOptedIn: false },
            }),
        ]);
        return {
            messages: {
                total: totalMessages,
                sent: sentMessages,
                failed: failedMessages,
                deliveryRate: totalMessages > 0 ? (sentMessages / totalMessages) * 100 : 0,
            },
            campaigns,
            contacts: {
                total: contacts + optedOutContacts,
                optedIn: contacts,
                optedOut: optedOutContacts,
                optInRate: (contacts + optedOutContacts) > 0 ?
                    (contacts / (contacts + optedOutContacts)) * 100 : 0,
            },
        };
    }
    async sendWelcomeMessage(phoneNumber, customerName) {
        const template = await this.templateService.renderTemplate('welcome_message', {
            customerName: customerName || 'Valued Customer',
            shopUrl: 'https://householdplanet.co.ke',
        });
        return this.whatsappService.sendMessage(phoneNumber, template, 'WELCOME');
    }
    async sendOrderStatusUpdate(orderId, status, customMessage) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true },
        });
        if (!order || !order.user?.phoneNumber)
            return false;
        let message = customMessage;
        if (!message) {
            const statusMessages = {
                PROCESSING: 'Your order is being processed and will be shipped soon.',
                SHIPPED: 'Great news! Your order has been shipped and is on its way.',
                OUT_FOR_DELIVERY: 'Your order is out for delivery and will arrive today.',
                DELIVERED: 'Your order has been successfully delivered. Thank you for shopping with us!',
            };
            message = statusMessages[status] || `Your order status has been updated to: ${status}`;
        }
        const fullMessage = `📦 Order Update\n\nOrder #${order.orderNumber}\n${message}\n\nTrack your order: https://householdplanet.co.ke/orders/${order.orderNumber}`;
        return this.whatsappService.sendMessage(order.user.phoneNumber, fullMessage, 'ORDER_UPDATE', orderId, order.userId);
    }
};
exports.WhatsAppBusinessService = WhatsAppBusinessService;
exports.WhatsAppBusinessService = WhatsAppBusinessService = WhatsAppBusinessService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        whatsapp_service_1.WhatsAppService,
        template_service_1.WhatsAppTemplateService])
], WhatsAppBusinessService);
//# sourceMappingURL=business.service.js.map