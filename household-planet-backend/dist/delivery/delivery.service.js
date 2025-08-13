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
exports.DeliveryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DeliveryService = class DeliveryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async initializeLocations() {
        const locations = [
            { name: 'Nairobi CBD', tier: 1, price: 100, description: 'Orders within CBD only', estimatedDays: 2, expressAvailable: true, expressPrice: 200 },
            { name: 'Kajiado (Naekana)', tier: 1, price: 150, description: 'Via Naekana', estimatedDays: 3, expressAvailable: false },
            { name: 'Kitengela (Via Shuttle)', tier: 1, price: 150, description: 'Via Shuttle', estimatedDays: 3, expressAvailable: false },
            { name: 'Thika (Super Metrol)', tier: 1, price: 150, description: 'Via Super Metrol', estimatedDays: 3, expressAvailable: false },
            { name: 'Juja (Via Super Metrol)', tier: 1, price: 200, description: 'Via Super Metrol', estimatedDays: 4, expressAvailable: false },
            { name: 'Kikuyu Town (Super Metrol)', tier: 1, price: 200, description: 'Via Super Metrol', estimatedDays: 4, expressAvailable: false },
            { name: 'Pangani', tier: 2, price: 250, estimatedDays: 3, expressAvailable: true, expressPrice: 400 },
            { name: 'Upperhill', tier: 2, price: 250, estimatedDays: 3, expressAvailable: true, expressPrice: 400 },
            { name: 'Bomet (Easycoach)', tier: 2, price: 300, description: 'Via Easycoach' },
            { name: 'Eastleigh', tier: 2, price: 300 },
            { name: 'Hurlingham (Ngong Rd)', tier: 2, price: 300, description: 'Rider' },
            { name: 'Industrial Area', tier: 2, price: 300, description: 'Rider' },
            { name: 'Kileleshwa', tier: 2, price: 300 },
            { name: 'Kilimani', tier: 2, price: 300 },
            { name: 'Machakos (Makos Sacco)', tier: 2, price: 300, description: 'Via Makos Sacco' },
            { name: 'Madaraka (Mombasa Rd)', tier: 2, price: 300, description: 'Rider' },
            { name: 'Makadara (Jogoo Rd)', tier: 2, price: 300, description: 'Rider' },
            { name: 'Mbagathi Way (Langata Rd)', tier: 2, price: 300, description: 'Rider' },
            { name: 'Mpaka Road', tier: 2, price: 300 },
            { name: 'Naivasha (Via NNUS)', tier: 2, price: 300, description: 'Via NNUS' },
            { name: 'Nanyuki (Nanyuki Cabs)', tier: 2, price: 300, description: 'Via Nanyuki Cabs' },
            { name: 'Parklands', tier: 2, price: 300 },
            { name: 'Riverside', tier: 2, price: 300 },
            { name: 'South B', tier: 2, price: 300 },
            { name: 'South C', tier: 2, price: 300 },
            { name: 'Westlands', tier: 2, price: 300, estimatedDays: 3, expressAvailable: true, expressPrice: 450 },
            { name: 'ABC (Waiyaki Way)', tier: 3, price: 350, description: 'Rider' },
            { name: 'Allsops', tier: 3, price: 350 },
            { name: 'Ruaraka', tier: 3, price: 350 },
            { name: 'Bungoma (EasyCoach)', tier: 3, price: 350, description: 'Via EasyCoach' },
            { name: 'Carnivore (Langata)', tier: 3, price: 350, description: 'Rider' },
            { name: 'DCI (Kiambu Rd)', tier: 3, price: 350, description: 'Rider' },
            { name: 'Eldoret (North-rift Shuttle)', tier: 3, price: 350, description: 'Via North-rift Shuttle' },
            { name: 'Embu (Using Kukena)', tier: 3, price: 350, description: 'Via Kukena' },
            { name: 'Homa Bay (Easy Coach)', tier: 3, price: 350, description: 'Via Easy Coach' },
            { name: 'Imara Daima (Boda Rider)', tier: 3, price: 350, description: 'Boda Rider' },
            { name: 'Jamhuri Estate', tier: 3, price: 350 },
            { name: 'Kericho (Using EasyCoach)', tier: 3, price: 350, description: 'Via EasyCoach' },
            { name: 'Kisii (Using Easycoach)', tier: 3, price: 350, description: 'Via Easycoach' },
            { name: 'Kisumu (Easy Coach-United Mall)', tier: 3, price: 350, description: 'Via Easy Coach-United Mall' },
            { name: 'Kitale (Northrift)', tier: 3, price: 350, description: 'Via Northrift' },
            { name: 'Lavington', tier: 3, price: 350 },
            { name: 'Mombasa (Dreamline Bus)', tier: 3, price: 350, description: 'Via Dreamline Bus' },
            { name: 'Nextgen Mall, Mombasa Road', tier: 3, price: 350 },
            { name: 'Roasters', tier: 3, price: 350 },
            { name: 'Rongo (Using EasyCoach)', tier: 3, price: 350, description: 'Via EasyCoach' },
            { name: 'Buruburu', tier: 3, price: 400 },
            { name: 'Donholm', tier: 3, price: 400 },
            { name: 'Kangemi', tier: 3, price: 400 },
            { name: 'Kasarani', tier: 3, price: 400 },
            { name: 'Kitisuru', tier: 3, price: 400 },
            { name: 'Lucky Summer', tier: 3, price: 400 },
            { name: 'Lumumba Drive', tier: 3, price: 400 },
            { name: 'Muthaiga', tier: 3, price: 400 },
            { name: 'Peponi Road', tier: 3, price: 400 },
            { name: 'Roysambu', tier: 3, price: 400 },
            { name: 'Thigiri', tier: 3, price: 400 },
            { name: 'Village Market', tier: 3, price: 400 },
            { name: 'Kahawa Sukari', tier: 4, price: 550, estimatedDays: 4, expressAvailable: true, expressPrice: 800 },
            { name: 'Kahawa Wendani', tier: 4, price: 550, estimatedDays: 4, expressAvailable: true, expressPrice: 800 },
            { name: 'Karen', tier: 4, price: 650, estimatedDays: 5, expressAvailable: true, expressPrice: 950 },
            { name: 'Kiambu', tier: 4, price: 650, estimatedDays: 5, expressAvailable: true, expressPrice: 950 },
            { name: 'JKIA', tier: 4, price: 700, estimatedDays: 3, expressAvailable: true, expressPrice: 1000 },
            { name: 'Ngong Town', tier: 4, price: 1000, estimatedDays: 5, expressAvailable: false },
        ];
        for (const location of locations) {
            await this.prisma.deliveryLocation.upsert({
                where: { name: location.name },
                update: location,
                create: location,
            });
        }
    }
    async getAllLocations() {
        return this.prisma.deliveryLocation.findMany({
            where: { isActive: true },
            orderBy: [{ tier: 'asc' }, { price: 'asc' }],
        });
    }
    async getLocationByName(name) {
        const location = await this.prisma.deliveryLocation.findUnique({
            where: { name, isActive: true },
        });
        if (!location) {
            throw new common_1.NotFoundException(`Delivery location '${name}' not found`);
        }
        return location;
    }
    async calculateDeliveryPrice(locationName, isExpress = false) {
        const location = await this.getLocationByName(locationName);
        if (isExpress && location.expressAvailable && location.expressPrice) {
            return location.expressPrice;
        }
        return location.price;
    }
    async getDeliveryEstimate(locationName) {
        const location = await this.getLocationByName(locationName);
        return {
            standardPrice: location.price,
            estimatedDays: location.estimatedDays,
            expressAvailable: location.expressAvailable,
            expressPrice: location.expressPrice
        };
    }
    async calculateBulkDiscount(subtotal, itemCount) {
        if (itemCount >= 10)
            return subtotal * 0.15;
        if (itemCount >= 5)
            return subtotal * 0.10;
        if (subtotal >= 10000)
            return subtotal * 0.05;
        return 0;
    }
    async getLocationsByTier(tier) {
        return this.prisma.deliveryLocation.findMany({
            where: { tier, isActive: true },
            orderBy: { price: 'asc' },
        });
    }
};
exports.DeliveryService = DeliveryService;
exports.DeliveryService = DeliveryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeliveryService);
//# sourceMappingURL=delivery.service.js.map