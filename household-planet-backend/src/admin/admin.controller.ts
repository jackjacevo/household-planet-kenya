import { Controller, Get, Post, Put, Delete, Query, Body, Param, UseGuards, UseInterceptors, UploadedFiles, ParseIntPipe, Res, ValidationPipe, UsePipes, Req, BadRequestException } from '@nestjs/common';
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
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: false, forbidNonWhitelisted: false }))
  createProduct(@Body() createProductDto: CreateProductDto, @Req() req) {
    console.log('Received product creation request:', JSON.stringify(createProductDto, null, 2));
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';
    return this.adminService.createProduct(createProductDto, req.user?.id, ipAddress, userAgent);
  }

  @Put('products/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto, @Req() req) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';
    return this.adminService.updateProduct(id, updateProductDto, req.user?.id, ipAddress, userAgent);
  }

  @Delete('products/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  deleteProduct(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';
    return this.adminService.deleteProduct(id, req.user?.id, ipAddress, userAgent);
  }

  @Post('products/bulk')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  bulkCreateProducts(@Body() bulkProductDto: BulkProductDto, @Req() req) {
    return this.adminService.bulkCreateProducts(bulkProductDto.products, req.user?.id);
  }

  @Put('products/bulk')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  bulkUpdateProducts(@Body() bulkUpdateDto: BulkUpdateDto, @Req() req) {
    return this.adminService.bulkUpdateProducts(bulkUpdateDto, req.user?.id);
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

  // Dedicated temp image upload endpoint
  @Post('products/temp/images')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 10, {
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new Error('Only JPG, PNG, and WebP image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  uploadTempImages(@UploadedFiles() files: Express.Multer.File[], @Req() req) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    return this.adminService.uploadTempImages(files);
  }

  @Post('products/:id/images')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 10, {
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new Error('Only JPG, PNG, and WebP image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  uploadProductImages(@Param('id', ParseIntPipe) id: number, @UploadedFiles() files: Express.Multer.File[], @Req() req) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    return this.adminService.uploadProductImages(id, files, req.user?.id);
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  deleteProductImage(@Param('id', ParseIntPipe) id: number, @Param('imageIndex', ParseIntPipe) imageIndex: number, @Req() req) {
    return this.adminService.deleteProductImage(id, imageIndex, req.user?.id);
  }

  @Delete('products/temp/images')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  deleteTempImage(@Body('imageUrl') imageUrl: string) {
    return this.adminService.deleteTempImage(imageUrl);
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  createCategory(@Body() categoryData: any, @Req() req) {
    return this.adminService.createCategory(categoryData, req.user?.id);
  }

  @Put('categories/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() categoryData: any, @Req() req) {
    return this.adminService.updateCategory(id, categoryData, req.user?.id);
  }

  @Delete('categories/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  deleteCategory(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.adminService.deleteCategory(id, req.user?.id);
  }

  @Post('categories/upload-image')
  @UseInterceptors(FilesInterceptor('image', 1, {
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return cb(new Error('Only JPG and PNG image files are allowed!'), false);
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
  getCategoryImage(@Param('filename') filename: string, @Res() res: any, @Req() req: any) {
    const path = require('path');
    const fs = require('fs');
    const imagePath = path.join(process.cwd(), 'uploads', 'categories', filename);
    
    // Enhanced CORS headers
    const origin = req.headers.origin;
    const allowedOrigins = ['https://householdplanetkenya.co.ke', 'https://www.householdplanetkenya.co.ke', 'http://localhost:3000'];
    if (allowedOrigins.includes(origin) || !origin) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    if (fs.existsSync(imagePath)) {
      // Set appropriate content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      if (ext === '.png') {
        res.setHeader('Content-Type', 'image/png');
      } else if (ext === '.jpg' || ext === '.jpeg') {
        res.setHeader('Content-Type', 'image/jpeg');
      }
      res.sendFile(imagePath);
    } else {
      res.status(404).send('Image not found');
    }
  }

  @Get('products/image/:filename')
  getProductImage(@Param('filename') filename: string, @Res() res: any, @Req() req: any) {
    const path = require('path');
    const fs = require('fs');
    const imagePath = path.join(process.cwd(), 'uploads', 'products', filename);
    
    // Enhanced CORS headers
    const origin = req.headers.origin;
    const allowedOrigins = ['https://householdplanetkenya.co.ke', 'https://www.householdplanetkenya.co.ke', 'http://localhost:3000'];
    if (allowedOrigins.includes(origin) || !origin) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    if (fs.existsSync(imagePath)) {
      // Set appropriate content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      if (ext === '.png') {
        res.setHeader('Content-Type', 'image/png');
      } else if (ext === '.jpg' || ext === '.jpeg') {
        res.setHeader('Content-Type', 'image/jpeg');
      }
      res.sendFile(imagePath);
    } else {
      res.status(404).send('Image not found');
    }
  }

  @Get('temp/image/:filename')
  getTempImage(@Param('filename') filename: string, @Res() res: any, @Req() req: any) {
    const path = require('path');
    const fs = require('fs');
    const imagePath = path.join(process.cwd(), 'uploads', 'temp', filename);
    
    const origin = req.headers.origin;
    const allowedOrigins = ['https://householdplanetkenya.co.ke', 'https://www.householdplanetkenya.co.ke', 'http://localhost:3000'];
    if (allowedOrigins.includes(origin) || !origin) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (fs.existsSync(imagePath)) {
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

  @Delete('brands/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  deleteBrand(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteBrand(id);
  }
}
