import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCategoryDto: CreateCategoryDto): Promise<{
        parent: {
            name: string;
            id: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
        };
        children: {
            name: string;
            id: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
        }[];
    } & {
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        image: string | null;
        parentId: string | null;
        sortOrder: number;
    }>;
    findAll(): Promise<({
        parent: {
            name: string;
            id: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
        };
        children: {
            name: string;
            id: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
        }[];
    } & {
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        image: string | null;
        parentId: string | null;
        sortOrder: number;
    })[]>;
    findOne(id: string): Promise<{
        parent: {
            name: string;
            id: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
        };
        children: {
            name: string;
            id: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
        }[];
        products: {
            name: string;
            id: string;
            slug: string;
            sku: string;
            description: string | null;
            shortDescription: string | null;
            price: number;
            comparePrice: number | null;
            weight: number | null;
            dimensions: string | null;
            images: string | null;
            categoryId: string;
            brandId: string | null;
            isActive: boolean;
            isFeatured: boolean;
            seoTitle: string | null;
            seoDescription: string | null;
            tags: string | null;
            stock: number;
            lowStockThreshold: number;
            trackInventory: boolean;
            averageRating: number | null;
            totalReviews: number;
            viewCount: number;
            searchKeywords: string | null;
            relatedProducts: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        image: string | null;
        parentId: string | null;
        sortOrder: number;
    }>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<{
        parent: {
            name: string;
            id: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
        };
        children: {
            name: string;
            id: string;
            slug: string;
            description: string | null;
            isActive: boolean;
            image: string | null;
            parentId: string | null;
            sortOrder: number;
        }[];
    } & {
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        image: string | null;
        parentId: string | null;
        sortOrder: number;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        slug: string;
        description: string | null;
        isActive: boolean;
        image: string | null;
        parentId: string | null;
        sortOrder: number;
    }>;
    seedCategories(): Promise<{
        message: string;
    }>;
}
