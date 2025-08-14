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
exports.GeographicRestrictionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GeographicRestrictionsService = class GeographicRestrictionsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.restrictedRegions = {
            alcohol: ['Mandera', 'Wajir', 'Garissa'],
            pharmaceuticals: [],
            electronics: [],
        };
    }
    async checkGeographicRestriction(productId, county, subcounty) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId.toString() },
            select: {
                geographicRestrictions: true,
                restrictedRegions: true
            },
        });
        if (!product)
            return { allowed: false, reason: 'Product not found' };
        const categoryRestrictions = this.restrictedRegions['general'] || [];
        if (categoryRestrictions.includes(county)) {
            return {
                allowed: false,
                reason: `Product not available in ${county}`
            };
        }
        if (product.restrictedRegions?.includes(county)) {
            return {
                allowed: false,
                reason: 'Product not available in your region'
            };
        }
        return { allowed: true };
    }
    async getAvailableRegions(productId) {
        const kenyanCounties = [
            'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
            'Kitale', 'Garissa', 'Kakamega', 'Machakos', 'Meru', 'Nyeri', 'Kericho'
        ];
        const product = await this.prisma.product.findUnique({
            where: { id: productId.toString() },
            select: {
                restrictedRegions: true
            },
        });
        if (!product)
            return [];
        const categoryRestrictions = this.restrictedRegions['general'] || [];
        const productRestrictions = product.restrictedRegions || [];
        const allRestrictions = [...categoryRestrictions, ...productRestrictions];
        return kenyanCounties.filter(county => !allRestrictions.includes(county));
    }
    async logGeographicAccess(userId, productId, county, allowed) {
        await this.prisma.geographicAccessLog.create({
            data: {
                userId: userId ? userId.toString() : null,
                productId: productId.toString(),
                country: county,
                allowed,
                accessedAt: new Date(),
            },
        });
    }
};
exports.GeographicRestrictionsService = GeographicRestrictionsService;
exports.GeographicRestrictionsService = GeographicRestrictionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GeographicRestrictionsService);
//# sourceMappingURL=geographic-restrictions.service.js.map