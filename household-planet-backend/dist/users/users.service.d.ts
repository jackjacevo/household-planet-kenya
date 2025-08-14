import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, AddAddressDto } from './dto/update-profile.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    updateProfile(userId: string | number, updateProfileDto: UpdateProfileDto): Promise<{
        user: {
            name: string;
            email: string;
            phone: string;
            role: string;
            dateOfBirth: Date;
            gender: string;
            id: string;
            avatar: string;
            emailVerified: boolean;
            phoneVerified: boolean;
        };
    }>;
    getProfile(userId: string | number): Promise<{
        user: {
            name: string;
            email: string;
            phone: string;
            role: string;
            id: string;
            createdAt: Date;
            emailVerified: boolean;
            phoneVerified: boolean;
            addresses: {
                phone: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                type: string;
                fullName: string;
                county: string;
                town: string;
                street: string;
                landmark: string | null;
                isDefault: boolean;
            }[];
        };
    }>;
    addAddress(userId: string | number, addAddressDto: AddAddressDto): Promise<{
        address: {
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: string;
            fullName: string;
            county: string;
            town: string;
            street: string;
            landmark: string | null;
            isDefault: boolean;
        };
    }>;
    getAddresses(userId: string | number): Promise<{
        addresses: {
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: string;
            fullName: string;
            county: string;
            town: string;
            street: string;
            landmark: string | null;
            isDefault: boolean;
        }[];
    }>;
    updateAddress(userId: string | number, addressId: string, updateAddressDto: AddAddressDto): Promise<{
        address: {
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: string;
            fullName: string;
            county: string;
            town: string;
            street: string;
            landmark: string | null;
            isDefault: boolean;
        };
    }>;
    deleteAddress(userId: string | number, addressId: string): Promise<{
        message: string;
    }>;
    verifyPhone(userId: string | number, token: string): Promise<{
        message: string;
    }>;
    sendPhoneVerification(userId: string | number): Promise<{
        message: string;
    }>;
    getDashboardStats(userId: string | number): Promise<{
        loyaltyPoints: number;
        totalSpent: number;
        totalOrders: number;
        wishlistItems: number;
        recentOrders: {
            id: string;
            createdAt: Date;
            status: string;
            total: number;
            orderNumber: string;
        }[];
        memberSince: Date;
    }>;
    updateSettings(userId: string | number, settings: {
        marketingEmails?: boolean;
        smsNotifications?: boolean;
        preferredLanguage?: string;
    }): Promise<{
        preferredLanguage: string;
        marketingEmails: boolean;
        smsNotifications: boolean;
    }>;
    getWishlist(userId: string | number): Promise<({
        product: {
            name: string;
            id: string;
            slug: string;
            price: number;
            images: string;
            isActive: boolean;
            stock: number;
        };
    } & {
        id: string;
        createdAt: Date;
        productId: string;
        userId: string;
        notifyOnStock: boolean;
        notifyOnSale: boolean;
    })[]>;
    addToWishlist(userId: string | number, productId: string): Promise<{
        product: {
            name: string;
            id: string;
            slug: string;
            price: number;
            images: string;
        };
    } & {
        id: string;
        createdAt: Date;
        productId: string;
        userId: string;
        notifyOnStock: boolean;
        notifyOnSale: boolean;
    }>;
    removeFromWishlist(userId: string | number, productId: string): Promise<{
        id: string;
        createdAt: Date;
        productId: string;
        userId: string;
        notifyOnStock: boolean;
        notifyOnSale: boolean;
    }>;
}
