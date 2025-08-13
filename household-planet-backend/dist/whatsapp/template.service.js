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
var WhatsAppTemplateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppTemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WhatsAppTemplateService = WhatsAppTemplateService_1 = class WhatsAppTemplateService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(WhatsAppTemplateService_1.name);
    }
    async createTemplate(name, type, template) {
        return this.prisma.whatsAppTemplate.create({
            data: { name, type, template },
        });
    }
    async getTemplate(name) {
        return this.prisma.whatsAppTemplate.findUnique({
            where: { name },
        });
    }
    async getAllTemplates() {
        return this.prisma.whatsAppTemplate.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateTemplate(name, template) {
        return this.prisma.whatsAppTemplate.update({
            where: { name },
            data: { template, updatedAt: new Date() },
        });
    }
    async renderTemplate(templateName, variables) {
        const template = await this.getTemplate(templateName);
        if (!template) {
            throw new Error(`Template ${templateName} not found`);
        }
        let rendered = template.template;
        Object.entries(variables).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value));
        });
        return rendered;
    }
    async seedDefaultTemplates() {
        const defaultTemplates = [
            {
                name: 'order_confirmation',
                type: 'ORDER_CONFIRMATION',
                template: '🎉 Order Confirmed!\n\nOrder #{{orderNumber}}\nTotal: KSh {{total}}\n\nThank you for shopping with Household Planet Kenya! We\'ll keep you updated on your delivery.\n\nTrack your order: {{trackingUrl}}',
            },
            {
                name: 'order_shipped',
                type: 'DELIVERY_UPDATE',
                template: '📦 Your order is on the way!\n\nOrder #{{orderNumber}} has been shipped and is heading to {{deliveryAddress}}.\n\nEstimated delivery: {{estimatedDelivery}}\n\nTrack your order: {{trackingUrl}}',
            },
            {
                name: 'order_delivered',
                type: 'DELIVERY_UPDATE',
                template: '✅ Order Delivered!\n\nOrder #{{orderNumber}} has been successfully delivered to {{deliveryAddress}}.\n\nThank you for choosing Household Planet Kenya! Please rate your experience: {{ratingUrl}}',
            },
            {
                name: 'abandoned_cart_1',
                type: 'ABANDONED_CART',
                template: '🛒 Don\'t forget your cart!\n\nYou have {{itemCount}} item{{itemPlural}} waiting for you (KSh {{totalValue}})\n\nComplete your purchase now and get FREE delivery on orders over KSh 2,000!\n\n🔗 Continue shopping: {{cartUrl}}',
            },
            {
                name: 'abandoned_cart_2',
                type: 'ABANDONED_CART',
                template: '🛒 Last chance!\n\nYour cart is still waiting with {{itemCount}} item{{itemPlural}}.\n\nGet 10% OFF with code COMEBACK10\n\n🔗 Complete your order: {{cartUrl}}',
            },
            {
                name: 'welcome_message',
                type: 'PROMOTIONAL',
                template: '🎉 Welcome to Household Planet Kenya!\n\nThank you for joining us, {{customerName}}!\n\nGet 15% OFF your first order with code WELCOME15\n\n🔗 Start shopping: {{shopUrl}}',
            },
            {
                name: 'payment_reminder',
                type: 'PAYMENT_REMINDER',
                template: '💳 Payment Reminder\n\nOrder #{{orderNumber}}\nAmount due: KSh {{amount}}\nDue date: {{dueDate}}\n\nPay now to avoid order cancellation: {{paymentUrl}}',
            },
            {
                name: 'support_response',
                type: 'SUPPORT',
                template: '💬 Support Response\n\nTicket #{{ticketId}}\n\n{{response}}\n\nNeed more help? Reply to this message or visit: {{supportUrl}}',
            },
        ];
        for (const template of defaultTemplates) {
            try {
                await this.prisma.whatsAppTemplate.upsert({
                    where: { name: template.name },
                    update: { template: template.template },
                    create: template,
                });
            }
            catch (error) {
                this.logger.error(`Failed to seed template ${template.name}:`, error);
            }
        }
        this.logger.log('Default WhatsApp templates seeded successfully');
    }
};
exports.WhatsAppTemplateService = WhatsAppTemplateService;
exports.WhatsAppTemplateService = WhatsAppTemplateService = WhatsAppTemplateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WhatsAppTemplateService);
//# sourceMappingURL=template.service.js.map