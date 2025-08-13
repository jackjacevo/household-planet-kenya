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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateProfile(userId, updateProfileDto) {
        if (updateProfileDto.phone) {
            const existingPhone = await this.prisma.user.findFirst({
                where: {
                    phone: updateProfileDto.phone,
                    NOT: { id: userId }
                },
            });
            if (existingPhone) {
                throw new common_1.BadRequestException('Phone number already exists');
            }
        }
        const updateData = {
            ...updateProfileDto,
            dateOfBirth: updateProfileDto.dateOfBirth ? new Date(updateProfileDto.dateOfBirth) : undefined,
        };
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                emailVerified: true,
                phoneVerified: true,
                avatar: true,
                dateOfBirth: true,
                gender: true,
            },
        });
        return { user };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                emailVerified: true,
                phoneVerified: true,
                addresses: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return { user };
    }
    async addAddress(userId, addAddressDto) {
        if (addAddressDto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }
        const address = await this.prisma.address.create({
            data: {
                ...addAddressDto,
                userId,
            },
        });
        return { address };
    }
    async getAddresses(userId) {
        const addresses = await this.prisma.address.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' },
        });
        return { addresses };
    }
    async updateAddress(userId, addressId, updateAddressDto) {
        const existingAddress = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!existingAddress) {
            throw new common_1.NotFoundException('Address not found');
        }
        if (updateAddressDto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }
        const address = await this.prisma.address.update({
            where: { id: addressId },
            data: updateAddressDto,
        });
        return { address };
    }
    async deleteAddress(userId, addressId) {
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!address) {
            throw new common_1.NotFoundException('Address not found');
        }
        await this.prisma.address.delete({
            where: { id: addressId },
        });
        return { message: 'Address deleted successfully' };
    }
    async verifyPhone(userId, token) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, phoneVerifyToken: token },
        });
        if (!user) {
            throw new common_1.NotFoundException('Invalid verification token');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                phoneVerified: true,
                phoneVerifyToken: null,
            },
        });
        return { message: 'Phone verified successfully' };
    }
    async sendPhoneVerification(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.phone) {
            throw new common_1.NotFoundException('User or phone not found');
        }
        const phoneVerifyToken = Math.floor(100000 + Math.random() * 900000).toString();
        await this.prisma.user.update({
            where: { id: userId },
            data: { phoneVerifyToken },
        });
        console.log(`SMS verification code for ${user.phone}: ${phoneVerifyToken}`);
        return { message: 'Verification code sent to your phone' };
    }
    async getDashboardStats(userId) {
        const [user, orderStats, wishlistCount, recentOrders] = await Promise.all([
            this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    loyaltyPoints: true,
                    totalSpent: true,
                    createdAt: true
                }
            }),
            this.prisma.order.aggregate({
                where: { userId },
                _count: { id: true },
                _sum: { total: true }
            }),
            this.prisma.wishlist.count({ where: { userId } }),
            this.prisma.order.findMany({
                where: { userId },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    total: true,
                    createdAt: true
                }
            })
        ]);
        return {
            loyaltyPoints: user?.loyaltyPoints || 0,
            totalSpent: user?.totalSpent || 0,
            totalOrders: orderStats._count.id,
            wishlistItems: wishlistCount,
            recentOrders,
            memberSince: user?.createdAt
        };
    }
    async updateSettings(userId, settings) {
        return this.prisma.user.update({
            where: { id: userId },
            data: settings,
            select: {
                marketingEmails: true,
                smsNotifications: true,
                preferredLanguage: true
            }
        });
    }
    async getWishlist(userId) {
        return this.prisma.wishlist.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        images: true,
                        slug: true,
                        stock: true,
                        isActive: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async addToWishlist(userId, productId) {
        return this.prisma.wishlist.upsert({
            where: {
                userId_productId: { userId, productId }
            },
            create: { userId, productId },
            update: {},
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        images: true,
                        slug: true
                    }
                }
            }
        });
    }
    async removeFromWishlist(userId, productId) {
        return this.prisma.wishlist.delete({
            where: {
                userId_productId: { userId, productId }
            }
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map