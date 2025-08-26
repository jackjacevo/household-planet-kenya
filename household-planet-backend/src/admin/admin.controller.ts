import { Controller, Get, Post, Put, Delete, Query, Body, Param, UseGuards, UseInterceptors, UploadedFiles, ParseIntPipe, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums';
import { BulkProductDto, BulkUpdateDto, ProductAnalyticsDto, ImageCropDto, VariantDto, SEOUpdateDto } from './dto/bulk-product.dto';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('analytics/sales')
  getSalesAnalytics(@Query('period') period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily') {
    return this.adminService.getSalesAnalytics(period);
  }

  @Get('analytics/performance')
  getPerformanceMetrics() {
    return this.adminService.getPerformanceMetrics();
  }

  @Get('analytics/conversion')
  getConversionRates(@Query('period') period: string = 'monthly') {
    return this.adminService.getConversionRates(period);
  }

  @Get('analytics/revenue')
  getRevenueAnalytics(@Query('period') period: string = 'monthly') {
    return this.adminService.getRevenueAnalytics(period);
  }

  @Get('analytics/geographic')
  getGeographicSales() {
    return this.adminService.getGeographicSales();
  }

  @Get('inventory/alerts')
  getInventoryAlerts() {
    return this.adminService.getInventoryAlerts();
  }

  @Get('customers/insights')
  getCustomerInsights() {
    return this.adminService.getCustomerInsights();
  }

  @Get('customers/behavior')
  getCustomerBehavior() {
    return this.adminService.getCustomerBehavior();
  }

  @Get('activities/recent')
  getRecentActivities() {
    return this.adminService.getRecentActivities();
  }

  @Get('kpis')
  getKPIs() {
    return this.adminService.getKPIs();
  }

  // Product Management
  @Get('products')
  getProducts(@Query() query: any) {
    return this.adminService.getProducts(query);
  }

  @Post('products')
  createProduct(@Body() createProductDto: CreateProductDto) {
    console.log('Received product creation request:', createProductDto);
    return this.adminService.createProduct(createProductDto);
  }

  @Put('products/:id')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.adminService.updateProduct(id, updateProductDto);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteProduct(id);
  }

  @Post('products/bulk')
  bulkCreateProducts(@Body() bulkProductDto: BulkProductDto) {
    return this.adminService.bulkCreateProducts(bulkProductDto.products);
  }

  @Put('products/bulk')
  bulkUpdateProducts(@Body() bulkUpdateDto: BulkUpdateDto) {
    return this.adminService.bulkUpdateProducts(bulkUpdateDto);
  }

  @Post('products/import/csv')
  @UseInterceptors(FilesInterceptor('file', 1, {
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.includes('csv') && !file.mimetype.includes('text')) {
        return cb(new Error('Only CSV files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  }))
  importProductsCsv(@UploadedFiles() files: Express.Multer.File[]) {
    return this.adminService.importProductsCsv(files[0]);
  }

  @Get('products/export/csv')
  exportProductsCsv() {
    return this.adminService.exportProductsCsv();
  }

  @Post('products/:id/images')
  @UseInterceptors(FilesInterceptor('images', 10, {
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  uploadProductImages(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }
    
    // Handle both numeric IDs and 'temp' for new products
    if (id === 'temp') {
      return this.adminService.uploadTempImages(files);
    }
    
    const productId = parseInt(id);
    if (isNaN(productId)) {
      throw new Error('Invalid product ID');
    }
    
    return this.adminService.uploadProductImages(productId, files);
  }

  @Post('products/images/crop')
  cropProductImage(@Body() cropDto: ImageCropDto) {
    return this.adminService.cropProductImage(cropDto);
  }

  @Post('products/:id/images/optimize')
  optimizeProductImages(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.optimizeProductImages(id);
  }

  @Delete('products/:id/images/:imageIndex')
  deleteProductImage(@Param('id', ParseIntPipe) id: number, @Param('imageIndex', ParseIntPipe) imageIndex: number) {
    return this.adminService.deleteProductImage(id, imageIndex);
  }

  @Post('products/:id/variants')
  createProductVariant(@Param('id', ParseIntPipe) id: number, @Body() variantDto: VariantDto) {
    return this.adminService.createProductVariant(id, variantDto);
  }

  @Put('products/:id/variants/:variantId')
  updateProductVariant(
    @Param('id', ParseIntPipe) id: number,
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body() variantDto: VariantDto
  ) {
    return this.adminService.updateProductVariant(id, variantId, variantDto);
  }

  @Delete('products/:id/variants/:variantId')
  deleteProductVariant(@Param('id', ParseIntPipe) id: number, @Param('variantId', ParseIntPipe) variantId: number) {
    return this.adminService.deleteProductVariant(id, variantId);
  }

  @Put('products/:id/seo')
  updateProductSEO(@Param('id', ParseIntPipe) id: number, @Body() seoDto: SEOUpdateDto) {
    return this.adminService.updateProductSEO(id, seoDto);
  }

  @Post('products/import/excel')
  @UseInterceptors(FilesInterceptor('file', 1, {
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.includes('excel') && !file.mimetype.includes('spreadsheet')) {
        return cb(new Error('Only Excel files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  }))
  importProductsExcel(@UploadedFiles() files: Express.Multer.File[]) {
    return this.adminService.importProductsExcel(files[0]);
  }

  @Get('products/export/excel')
  exportProductsExcel() {
    return this.adminService.exportProductsExcel();
  }

  @Get('products/analytics')
  getProductAnalytics(@Query() query: ProductAnalyticsDto) {
    return this.adminService.getProductAnalytics(query);
  }

  @Get('products/popular')
  getPopularProducts(@Query('period') period: string = 'monthly') {
    return this.adminService.getPopularProducts(period);
  }

  @Get('categories/popular')
  getPopularCategories(@Query('period') period: string = 'monthly') {
    return this.adminService.getPopularCategories(period);
  }

  // Activities endpoints
  @Get('activities')
  getActivities(@Query() query: any) {
    return this.adminService.getActivities(query);
  }

  @Get('activities/stats')
  getActivitiesStats() {
    return this.adminService.getActivitiesStats();
  }

  // Category Management
  @Get('categories')
  getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  createCategory(@Body() categoryData: any) {
    return this.adminService.createCategory(categoryData);
  }

  @Put('categories/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() categoryData: any) {
    return this.adminService.updateCategory(id, categoryData);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCategory(id);
  }

  @Post('categories/upload-image')
  @UseInterceptors(FilesInterceptor('image', 1, {
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  uploadCategoryImage(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new Error('No file uploaded');
    }
    return this.adminService.uploadCategoryImage(files[0]);
  }

  @Get('categories/image/:filename')
  getCategoryImage(@Param('filename') filename: string, @Res() res: any) {
    const path = require('path');
    const fs = require('fs');
    const imagePath = path.join(process.cwd(), 'uploads', 'categories', filename);
    
    if (fs.existsSync(imagePath)) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.sendFile(imagePath);
    } else {
      res.status(404).send('Image not found');
    }
  }

  @Put('categories/reorder')
  reorderCategories(@Body() orderData: { categoryId: number; sortOrder: number }[]) {
    return this.adminService.reorderCategories(orderData);
  }

  // Brand Management
  @Get('brands')
  getBrands() {
    return this.adminService.getBrands();
  }

  @Post('brands')
  createBrand(@Body() brandData: any) {
    return this.adminService.createBrand(brandData);
  }

  @Put('brands/:id')
  updateBrand(@Param('id', ParseIntPipe) id: number, @Body() brandData: any) {
    return this.adminService.updateBrand(id, brandData);
  }
}