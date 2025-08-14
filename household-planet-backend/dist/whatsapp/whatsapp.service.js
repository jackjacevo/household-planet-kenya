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
var WhatsAppService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_web_js_1 = require("whatsapp-web.js");
const QRCode = require("qrcode");
const prisma_service_1 = require("../prisma/prisma.service");
let WhatsAppService = WhatsAppService_1 = class WhatsAppService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(WhatsAppService_1.name);
        this.isReady = false;
        this.client = new whatsapp_web_js_1.Client({
            authStrategy: new whatsapp_web_js_1.LocalAuth(),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            },
        });
    }
    async onModuleInit() {
        await this.initializeWhatsApp();
    }
    async initializeWhatsApp() {
        this.client.on('qr', async (qr) => {
            this.logger.log('QR Code received');
            this.qrCode = await QRCode.toDataURL(qr);
        });
        this.client.on('ready', () => {
            this.logger.log('WhatsApp client is ready!');
            this.isReady = true;
        });
        this.client.on('authenticated', () => {
            this.logger.log('WhatsApp client authenticated');
        });
        this.client.on('auth_failure', (msg) => {
            this.logger.error('Authentication failed:', msg);
        });
        this.client.on('disconnected', (reason) => {
            this.logger.warn('WhatsApp client disconnected:', reason);
            this.isReady = false;
        });
        await this.client.initialize();
    }
    getQRCode() {
        return this.qrCode;
    }
    isClientReady() {
        return this.isReady;
    }
    async sendMessage(phoneNumber, message, type, orderId, userId, mediaUrl) {
        const userIdStr = userId ? (typeof userId === 'string' ? userId : String(userId)) : undefined;
        try {
            if (!this.isReady) {
                throw new Error('WhatsApp client is not ready');
            }
            const formattedNumber = this.formatPhoneNumber(phoneNumber);
            let sentMessage;
            if (mediaUrl) {
                const media = await whatsapp_web_js_1.MessageMedia.fromUrl(mediaUrl);
                sentMessage = await this.client.sendMessage(formattedNumber, media, { caption: message });
            }
            else {
                sentMessage = await this.client.sendMessage(formattedNumber, message);
            }
            await this.logMessage(phoneNumber, message, type, 'SENT', orderId, userIdStr, mediaUrl);
            this.logger.log(`Message sent to ${phoneNumber}: ${message.substring(0, 50)}...`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send message to ${phoneNumber}:`, error);
            await this.logMessage(phoneNumber, message, type, 'FAILED', orderId, userIdStr, mediaUrl, error.message);
            return false;
        }
    }
    async sendOrderConfirmation(phoneNumber, orderNumber, total, orderId, userId) {
        const message = `🎉 Order Confirmed!\n\nOrder #${orderNumber}\nTotal: KSh ${total.toLocaleString()}\n\nThank you for shopping with Household Planet Kenya! We'll keep you updated on your delivery.\n\nTrack your order: https://householdplanet.co.ke/orders/${orderNumber}`;
        return this.sendMessage(phoneNumber, message, 'ORDER_CONFIRMATION', orderId, userId);
    }
    async sendDeliveryUpdate(phoneNumber, orderNumber, status, location, orderId, userId) {
        let message = `📦 Delivery Update\n\nOrder #${orderNumber}\nStatus: ${status}`;
        if (location) {
            message += `\nLocation: ${location}`;
        }
        message += `\n\nTrack your order: https://householdplanet.co.ke/orders/${orderNumber}`;
        return this.sendMessage(phoneNumber, message, 'DELIVERY_UPDATE', orderId, userId);
    }
    async sendAbandonedCartReminder(phoneNumber, cartItems, userId) {
        const itemCount = cartItems.length;
        const totalValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const message = `🛒 Don't forget your cart!\n\nYou have ${itemCount} item${itemCount > 1 ? 's' : ''} waiting for you (KSh ${totalValue.toLocaleString()})\n\nComplete your purchase now and get FREE delivery on orders over KSh 2,000!\n\n🔗 Continue shopping: https://householdplanet.co.ke/cart`;
        return this.sendMessage(phoneNumber, message, 'ABANDONED_CART', null, userId);
    }
    async sendPromotionalMessage(phoneNumber, title, description, link, userId) {
        let message = `🎁 ${title}\n\n${description}`;
        if (link) {
            message += `\n\n🔗 Shop now: ${link}`;
        }
        return this.sendMessage(phoneNumber, message, 'PROMOTIONAL', null, userId);
    }
    async sendSupportMessage(phoneNumber, ticketId, response, userId) {
        const message = `💬 Support Response\n\nTicket #${ticketId}\n\n${response}\n\nNeed more help? Reply to this message or visit: https://householdplanet.co.ke/support`;
        return this.sendMessage(phoneNumber, message, 'SUPPORT', null, userId);
    }
    formatPhoneNumber(phoneNumber) {
        let cleaned = phoneNumber.replace(/\D/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '254' + cleaned.substring(1);
        }
        else if (cleaned.startsWith('254')) {
        }
        else if (cleaned.length === 9) {
            cleaned = '254' + cleaned;
        }
        return cleaned + '@c.us';
    }
    async logMessage(phoneNumber, message, type, status, orderId, userId, mediaUrl, failureReason) {
        try {
            await this.prisma.whatsAppMessage.create({
                data: {
                    phoneNumber,
                    message,
                    type,
                    status,
                    orderId,
                    userId,
                    mediaUrl,
                    failureReason,
                    sentAt: status === 'SENT' ? new Date() : null,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to log WhatsApp message:', error);
        }
    }
    async getMessageHistory(phoneNumber, userId, limit = 50) {
        const userIdStr = userId ? (typeof userId === 'string' ? userId : String(userId)) : undefined;
        return this.prisma.whatsAppMessage.findMany({
            where: {
                ...(phoneNumber && { phoneNumber }),
                ...(userIdStr && { userId: userIdStr }),
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
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
    async getMessageStats() {
        const [total, sent, failed, pending] = await Promise.all([
            this.prisma.whatsAppMessage.count(),
            this.prisma.whatsAppMessage.count({ where: { status: 'SENT' } }),
            this.prisma.whatsAppMessage.count({ where: { status: 'FAILED' } }),
            this.prisma.whatsAppMessage.count({ where: { status: 'PENDING' } }),
        ]);
        return { total, sent, failed, pending };
    }
};
exports.WhatsAppService = WhatsAppService;
exports.WhatsAppService = WhatsAppService = WhatsAppService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WhatsAppService);
//# sourceMappingURL=whatsapp.service.js.map