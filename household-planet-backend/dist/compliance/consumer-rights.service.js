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
exports.ConsumerRightsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ConsumerRightsService = class ConsumerRightsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getConsumerRights() {
        return {
            rightToInformation: {
                title: 'Right to Information',
                description: 'You have the right to receive accurate information about products and services.',
                details: [
                    'Product specifications and features',
                    'Pricing and payment terms',
                    'Delivery and return policies',
                    'Warranty and guarantee terms',
                ],
            },
            rightToChoose: {
                title: 'Right to Choose',
                description: 'You have the right to choose from a variety of products at competitive prices.',
                details: [
                    'Access to multiple product options',
                    'Competitive pricing',
                    'No forced bundling',
                    'Freedom to cancel orders before shipment',
                ],
            },
            rightToSafety: {
                title: 'Right to Safety',
                description: 'You have the right to products that are safe for use.',
                details: [
                    'Products meet safety standards',
                    'Clear safety instructions and warnings',
                    'Recall notifications for unsafe products',
                    'Safe packaging and delivery',
                ],
            },
            rightToRedress: {
                title: 'Right to Redress',
                description: 'You have the right to seek compensation for defective products or poor service.',
                details: [
                    '30-day return policy',
                    'Full refund for defective products',
                    'Replacement for damaged items',
                    'Compensation for service failures',
                ],
            },
            rightToPrivacy: {
                title: 'Right to Privacy',
                description: 'You have the right to privacy and data protection.',
                details: [
                    'Secure handling of personal data',
                    'No sharing without consent',
                    'Right to access your data',
                    'Right to delete your data',
                ],
            },
        };
    }
    async recordConsumerComplaint(userId, complaintData) {
        return this.prisma.consumerComplaint.create({
            data: {
                userId: userId.toString(),
                type: complaintData.type,
                description: complaintData.description,
                status: 'SUBMITTED',
            },
        });
    }
    async getReturnPolicy() {
        return {
            returnPeriod: '30 days',
            conditions: [
                'Items must be in original condition',
                'Original packaging required',
                'Receipt or order confirmation needed',
                'No damage from misuse',
            ],
            process: [
                'Contact customer service',
                'Receive return authorization',
                'Package item securely',
                'Ship to return address',
                'Receive refund within 5-7 business days',
            ],
            exceptions: [
                'Perishable goods',
                'Personalized items',
                'Digital products',
                'Items damaged by customer',
            ],
            refundMethods: [
                'Original payment method',
                'Store credit',
                'Bank transfer (for cash payments)',
            ],
        };
    }
    async getWarrantyInfo(productId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId.toString() },
            select: {
                name: true,
                warrantyPeriod: true,
                warrantyType: true,
                warrantyTerms: true,
            },
        });
        if (!product)
            return null;
        return {
            product: product.name,
            warrantyPeriod: product.warrantyPeriod || '1 year',
            warrantyType: product.warrantyType || 'Manufacturer warranty',
            terms: product.warrantyTerms || [
                'Covers manufacturing defects',
                'Does not cover misuse or accidents',
                'Proof of purchase required',
                'Warranty void if tampered',
            ],
            claimProcess: [
                'Contact customer service',
                'Provide proof of purchase',
                'Describe the issue',
                'Follow repair/replacement instructions',
            ],
        };
    }
};
exports.ConsumerRightsService = ConsumerRightsService;
exports.ConsumerRightsService = ConsumerRightsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConsumerRightsService);
//# sourceMappingURL=consumer-rights.service.js.map