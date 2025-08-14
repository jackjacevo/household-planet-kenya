export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    avatar?: string;
    dateOfBirth?: Date;
    gender?: string;
    loyaltyPoints?: number;
    totalSpent?: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface JwtUser {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    avatar?: string;
}
export interface AuthResponse {
    user: JwtUser;
    accessToken: string;
    refreshToken?: string;
}
