import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as csv from 'csv-parser';
import * as XLSX from 'xlsx';
import { createReadStream } from 'fs';
import { BulkProductDto } from '../dto/bulk-import.dto';

@Injectable()
export class BulkImportService {
  constructor(private prisma: PrismaService) {}

  async importFromCSV(filePath: string) {
    const products: BulkProductDto[] = [];
    const errors: string[] = [];

    return new Promise((resolve, reject) => {
      createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            const product = this.parseProductRow(row);
            products.push(product);
          } catch (error) {
            errors.push(`Row error: ${error.message}`);
          }
        })
        .on('end', async () => {
          try {
            const result = await this.bulkCreateProducts(products);
            resolve({ ...result, errors });
          } catch (error) {
            reject(error);
          }
        });
    });
  }

  async importFromExcel(filePath: string) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const products: BulkProductDto[] = [];
    const errors: string[] = [];

    data.forEach((row: any, index) => {
      try {
        const product = this.parseProductRow(row);
        products.push(product);
      } catch (error) {
        errors.push(`Row ${index + 1} error: ${error.message}`);
      }
    });

    const result = await this.bulkCreateProducts(products);
    return { ...result, errors };
  }

  private parseProductRow(row: any): BulkProductDto {
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
      tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
      variants: row.variants ? JSON.parse(row.variants) : []
    };
  }

  private async bulkCreateProducts(products: BulkProductDto[]) {
    const created: any[] = [];
    const failed: any[] = [];

    for (const productData of products) {
      try {
        const { variants, tags, ...productInfo } = productData;
        
        // Generate slug from name
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

        // Create variants if provided
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
      } catch (error) {
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
}