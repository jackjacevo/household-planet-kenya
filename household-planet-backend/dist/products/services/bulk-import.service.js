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
exports.BulkImportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const csv = require("csv-parser");
const XLSX = require("xlsx");
const fs_1 = require("fs");
let BulkImportService = class BulkImportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async importFromCSV(filePath) {
        const products = [];
        const errors = [];
        return new Promise((resolve, reject) => {
            (0, fs_1.createReadStream)(filePath)
                .pipe(csv())
                .on('data', (row) => {
                try {
                    const product = this.parseProductRow(row);
                    products.push(product);
                }
                catch (error) {
                    errors.push(`Row error: ${error.message}`);
                }
            })
                .on('end', async () => {
                try {
                    const result = await this.bulkCreateProducts(products);
                    resolve({ ...result, errors });
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    async importFromExcel(filePath) {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        const products = [];
        const errors = [];
        data.forEach((row, index) => {
            try {
                const product = this.parseProductRow(row);
                products.push(product);
            }
            catch (error) {
                errors.push(`Row ${index + 1} error: ${error.message}`);
            }
        });
        const result = await this.bulkCreateProducts(products);
        return { ...result, errors };
    }
    parseProductRow(row) {
        return {
            name: row.name || row.Name,
            sku: row.sku || row.SKU,
            description: row.description || row.Description,
            shortDescription: row.shortDescription || row['Short Description'],
            price: parseFloat(row.price || row.Price),
            comparePrice: row.comparePrice ? parseFloat(row.comparePrice) : undefined,
            categoryId: row.categoryId || row['Category ID'],
            stock: row.stock ? parseInt(row.stock) : 0,
            lowStockThreshold: row.lowStockThreshold ? parseInt(row.lowStockThreshold) : 10,
            trackInventory: row.trackInventory !== 'false',
            tags: row.tags ? row.tags.split(',').map((t) => t.trim()) : [],
            variants: row.variants ? JSON.parse(row.variants) : []
        };
    }
    async bulkCreateProducts(products) {
        const created = [];
        const failed = [];
        for (const productData of products) {
            try {
                const { variants, tags, ...productInfo } = productData;
                const slug = productInfo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const product = await this.prisma.product.create({
                    data: {
                        name: productInfo.name,
                        sku: productInfo.sku,
                        description: productInfo.description,
                        shortDescription: productInfo.shortDescription,
                        price: productInfo.price,
                        comparePrice: productInfo.comparePrice,
                        stock: productInfo.stock || 0,
                        lowStockThreshold: productInfo.lowStockThreshold || 10,
                        trackInventory: productInfo.trackInventory !== false,
                        slug,
                        tags: tags ? JSON.stringify(tags) : null,
                        searchKeywords: `${productInfo.name} ${productInfo.description} ${tags?.join(' ') || ''}`.toLowerCase(),
                        category: {
                            connect: { id: productInfo.categoryId }
                        }
                    }
                });
                if (variants && variants.length > 0) {
                    for (const variantData of variants) {
                        await this.prisma.productVariant.create({
                            data: {
                                name: variantData.name,
                                sku: variantData.sku,
                                price: variantData.price,
                                stock: variantData.stock,
                                size: variantData.size,
                                color: variantData.color,
                                material: variantData.material,
                                lowStockThreshold: 5,
                                productId: product.id
                            }
                        });
                    }
                }
                created.push(product);
            }
            catch (error) {
                failed.push({ product: productData, error: error.message });
            }
        }
        return {
            created: created.length,
            failed: failed.length,
            details: { created, failed }
        };
    }
    async exportToCSV() {
        const products = await this.prisma.product.findMany({
            include: {
                category: true,
                variants: true
            }
        });
        const csvData = products.map(product => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            description: product.description,
            price: product.price,
            comparePrice: product.comparePrice,
            stock: product.stock,
            lowStockThreshold: product.lowStockThreshold,
            categoryName: product.category.name,
            categoryId: product.categoryId,
            isActive: product.isActive,
            isFeatured: product.isFeatured,
            tags: product.tags ? JSON.parse(product.tags).join(', ') : '',
            variants: product.variants.length,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        }));
        return csvData;
    }
    async exportToExcel() {
        const csvData = await this.exportToCSV();
        const worksheet = XLSX.utils.json_to_sheet(csvData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
        return workbook;
    }
};
exports.BulkImportService = BulkImportService;
exports.BulkImportService = BulkImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BulkImportService);
//# sourceMappingURL=bulk-import.service.js.map