export interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    images?: string[];
    categoryId: string;
    stock: number;
    isActive: boolean;
    isFeatured: boolean;
    averageRating?: number;
    totalReviews?: number;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface ProductVariant {
    id: string;
    productId: string;
    name: string;
    price: number;
    stock: number;
    attributes?: Record<string, any>;
    isActive: boolean;
}
export interface ProductReview {
    id: string;
    productId: string;
    userId: string;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
    createdAt: Date;
}
export interface SearchFilters {
    q?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: 'price' | 'rating' | 'newest' | 'popular';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
