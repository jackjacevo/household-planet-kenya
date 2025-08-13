export declare class SearchFiltersDto {
    q?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    colors?: string[];
    sizes?: string[];
    materials?: string[];
    inStock?: boolean;
    sortBy?: 'price' | 'rating' | 'newest' | 'popular';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
