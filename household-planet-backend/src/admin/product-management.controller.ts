import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProductManagementService } from './product-management.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('api/admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ProductManagementController {
  constructor(private productManagementService: ProductManagementService) {}

  @Post()
  async createProduct(@Body() data: any) {
    return this.productManagementService.createProduct(data);
  }

  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.productManagementService.updateProduct(id, data);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productManagementService.deleteProduct(id);
  }

  @Put('bulk/update')
  async bulkUpdateProducts(@Body() updates: Array<{ id: string; data: any }>) {
    return this.productManagementService.bulkUpdateProducts(updates);
  }

  @Delete('bulk')
  async bulkDeleteProducts(@Body() { ids }: { ids: string[] }) {
    return this.productManagementService.bulkDeleteProducts(ids);
  }

  @Post('import/csv')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/imports',
      filename: (req, file, cb) => {
        cb(null, `products-${Date.now()}${extname(file.originalname)}`);
      }
    })
  }))
  async importCSV(@UploadedFile() file: Express.Multer.File) {
    return this.productManagementService.importProductsFromCSV(file.path);
  }

  @Get('export/csv')
  async exportCSV() {
    return this.productManagementService.exportProductsToCSV();
  }

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images', 10, {
    storage: diskStorage({
      destination: './uploads/products',
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      }
    })
  }))
  async uploadImages(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[]) {
    const imagePaths = files.map(file => `/uploads/products/${file.filename}`);
    return this.productManagementService.updateProduct(id, {
      images: JSON.stringify(imagePaths)
    });
  }

  @Post(':id/variants')
  async createVariant(@Param('id') productId: string, @Body() data: any) {
    return this.productManagementService.createVariant(productId, data);
  }

  @Put('variants/:id')
  async updateVariant(@Param('id') id: string, @Body() data: any) {
    return this.productManagementService.updateVariant(id, data);
  }

  @Delete('variants/:id')
  async deleteVariant(@Param('id') id: string) {
    return this.productManagementService.deleteVariant(id);
  }

  @Get(':id/analytics')
  async getProductAnalytics(@Param('id') id: string) {
    return this.productManagementService.getProductAnalytics(id);
  }
}

@Controller('api/admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CategoryManagementController {
  constructor(private productManagementService: ProductManagementService) {}

  @Post()
  async createCategory(@Body() data: any) {
    return this.productManagementService.createCategory(data);
  }

  @Put(':id')
  async updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.productManagementService.updateCategory(id, data);
  }

  @Put('reorder')
  async reorderCategories(@Body() orders: Array<{ id: string; sortOrder: number }>) {
    return this.productManagementService.reorderCategories(orders);
  }
}