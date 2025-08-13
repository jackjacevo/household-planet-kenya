import { UsersService } from './users.service';
import { UpdateProfileDto, AddAddressDto } from './dto/update-profile.dto';
import { UserRole } from '../common/enums';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(user: any): Promise<{
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
    updateProfile(user: any, updateProfileDto: UpdateProfileDto): Promise<{
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
    getAddresses(user: any): Promise<{
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
    addAddress(user: any, addAddressDto: AddAddressDto): Promise<{
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
    updateAddress(user: any, addressId: string, updateAddressDto: AddAddressDto): Promise<{
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
    deleteAddress(user: any, addressId: string): Promise<{
        message: string;
    }>;
    sendPhoneVerification(user: any): Promise<{
        message: string;
    }>;
    verifyPhone(user: any, token: string): Promise<{
        message: string;
    }>;
    getAllUsers(): {
        message: string;
    };
    updateUserRole(userId: string, role: UserRole): {
        message: string;
    };
    toggleUserStatus(userId: string, isActive: boolean): {
        message: string;
    };
    getDashboardStats(userId: string): Promise<{
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
    updateSettings(userId: string, settings: {
        marketingEmails?: boolean;
        smsNotifications?: boolean;
        preferredLanguage?: string;
    }): Promise<{
        preferredLanguage: string;
        marketingEmails: boolean;
        smsNotifications: boolean;
    }>;
    getWishlist(userId: string): Promise<({
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
    addToWishlist(userId: string, productId: string): Promise<{
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
    removeFromWishlist(userId: string, productId: string): Promise<{
        id: string;
        createdAt: Date;
        productId: string;
        userId: string;
        notifyOnStock: boolean;
        notifyOnSale: boolean;
    }>;
}
