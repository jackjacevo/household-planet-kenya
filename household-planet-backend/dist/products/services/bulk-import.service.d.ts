import { PrismaService } from '../../prisma/prisma.service';
import * as XLSX from 'xlsx';
export declare class BulkImportService {
    private prisma;
    constructor(prisma: PrismaService);
    importFromCSV(filePath: string): Promise<unknown>;
    importFromExcel(filePath: string): Promise<{
        errors: string[];
        created: number;
        failed: number;
        details: {
            created: any[];
            failed: any[];
        };
    }>;
    private parseProductRow;
    private bulkCreateProducts;
    exportToCSV(): Promise<{
        id: string;
        name: string;
        sku: string;
        description: string;
        price: number;
        comparePrice: number;
        stock: number;
        lowStockThreshold: number;
        categoryName: string;
        categoryId: string;
        isActive: boolean;
        isFeatured: boolean;
        tags: any;
        variants: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    exportToExcel(): Promise<XLSX.WorkBook>;
}
