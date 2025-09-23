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
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/customer-growth')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getCustomerGrowth() {
    return this.adminService.getCustomerInsights();
  }

  @Get('analytics/sales')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getSalesAnalytics(@Query('period') period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily') {
    return this.adminService.getSalesAnalytics(period);
  }

  @Get('analytics/performance')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getPerformanceMetrics() {
    return this.adminService.getPerformanceMetrics();
  }

  @Get('analytics/conversion')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getConversionRates(@Query('period') period: string = 'monthly') {
    return this.adminService.getConversionRates(period);
  }

  @Get('analytics/revenue')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getRevenueAnalytics(@Query('period') period: string = 'monthly') {
    return this.adminService.getRevenueAnalytics(period);
  }

  @Get('analytics/geographic')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getGeographicSales() {
    return this.adminService.getGeographicSales();
  }

  @Get('inventory/alerts')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getInventoryAlerts() {
    return this.adminService.getInventoryAlerts();
  }

  @Get('customers/insights')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getCustomerInsights() {
    return this.adminService.getCustomerInsights();
  }

  @Get('customers/behavior')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getCustomerBehavior() {
    return this.adminService.getCustomerBehavior();
  }

  @Get('activities/recent')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getRecentActivities() {
    return this.adminService.getRecentActivities();
  }

  // Product Management
  @Get('products')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getProducts(@Query() query: any) {
    return this.adminService.getProducts(query);
  }

  @Post('products')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: false, forbidNonWhitelisted: false }))
  createProduct(@Body() createProductDto: CreateProductDto, @Req() req) {
    console.log('Received product creation request:', JSON.stringify(createProductDto, null, 2));
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';
    return this.adminService.createProduct(createProductDto, req.user?.id, ipAddress, userAgent);
  }

  @Put('products/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto, @Req() req) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';
    return this.adminService.updateProduct(id, updateProductDto, req.user?.id, ipAddress, userAgent);
  }

  @Delete('products/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  deleteProduct(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';
    return this.adminService.deleteProduct(id, req.user?.id, ipAddress, userAgent);
  }

  @Post('products/bulk-delete')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  bulkDeleteProducts(@Body() body: { productIds: number[] }, @Req() req) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.get('User-Agent') || 'Unknown';
    return this.adminService.bulkDeleteProducts(body.productIds, req.user?.id, ipAddress, userAgent);
  }

  @Post('products/bulk')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  bulkCreateProducts(@Body() bulkProductDto: BulkProductDto, @Req() req) {
    return this.adminService.bulkCreateProducts(bulkProductDto.products, req.user?.id);
  }

  @Put('products/bulk')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  bulkUpdateProducts(@Body() bulkUpdateDto: BulkUpdateDto, @Req() req) {
    return this.adminService.bulkUpdateProducts(bulkUpdateDto, req.user?.id);
  }

  @Post('products/import/csv')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  exportProductsCsv() {
    return this.adminService.exportProductsCsv();
  }

  // Dedicated temp image upload endpoint
  @Post('products/temp/images')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
    try {
      console.log('🔍 Admin temp images upload endpoint called');
      console.log('📁 Files received:', files ? files.map(f => ({ name: f.originalname, size: f.size, type: f.mimetype })) : 'No files');
      console.log('👤 User:', req.user ? { id: req.user.id, email: req.user.email } : 'No user');
      
      if (!files || files.length === 0) {
        console.log('❌ No files uploaded to temp endpoint');
        throw new BadRequestException('No files uploaded');
      }
      
      const result = this.adminService.uploadTempImages(files);
      console.log('✅ Temp images upload successful');
      return result;
    } catch (error) {
      console.error('❌ Admin temp images upload failed:', error);
      throw error;
    }
  }

  @Post('products/:id/images')
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
    try {
      console.log(`🔍 Admin product ${id} images upload endpoint called`);
      console.log('📁 Files received:', files ? files.map(f => ({ name: f.originalname, size: f.size, type: f.mimetype })) : 'No files');
      
      if (!files || files.length === 0) {
        console.log('❌ No files uploaded to product images endpoint');
        throw new BadRequestException('No files uploaded');
      }
      
      const result = this.adminService.uploadProductImages(id, files, req.user?.id);
      console.log('✅ Product images upload successful');
      return result;
    } catch (error) {
      console.error('❌ Admin product images upload failed:', error);
      throw error;
    }
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
  deleteProductImage(@Param('id', ParseIntPipe) id: number, @Param('imageIndex', ParseIntPipe) imageIndex: number, @Req() req) {
    return this.adminService.deleteProductImage(id, imageIndex, req.user?.id);
  }

  @Delete('products/temp/images')
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
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getProductAnalytics(@Query() query: ProductAnalyticsDto) {
    return this.adminService.getProductAnalytics(query);
  }

  @Get('products/popular')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getPopularProducts(@Query('period') period: string = 'monthly') {
    return this.adminService.getPopularProducts(period);
  }

  @Get('categories/popular')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getPopularCategories(@Query('period') period: string = 'monthly') {
    return this.adminService.getPopularCategories(period);
  }

  // Activities endpoints
  @Get('activities')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getActivities(@Query() query: any) {
    return this.adminService.getActivities(query);
  }

  @Get('activity-stats')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getActivitiesStats() {
    return this.adminService.getActivitiesStats();
  }

  // Category Management
  @Get('categories')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  createCategory(@Body() categoryData: any, @Req() req) {
    return this.adminService.createCategory(categoryData, req.user?.id);
  }

  @Put('categories/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() categoryData: any, @Req() req) {
    return this.adminService.updateCategory(id, categoryData, req.user?.id);
  }

  @Delete('categories/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  deleteCategory(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.adminService.deleteCategory(id, req.user?.id);
  }

  @Post('categories/upload')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(FilesInterceptor('file', 1, {
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|bmp|tiff|svg|ico)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  uploadCategoryImageAlt(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new Error('No file uploaded');
    }
    return this.adminService.uploadCategoryImage(files[0]);
  }

  @Post('categories/upload-image')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(FilesInterceptor('image', 1, {
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|bmp|tiff|svg|ico)$/)) {
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
  getCategoryImage(@Param('filename') filename: string, @Res() res: any, @Req() req: any) {
    const path = require('path');
    const fs = require('fs');
    const imagePath = path.join(process.cwd(), 'uploads', 'categories', filename);
    
    // Enhanced CORS headers
    const origin = req.headers.origin;
    const allowedOrigins = ['https://householdplanetkenya.co.ke', 'https://www.householdplanetkenya.co.ke', 'http://localhost:3000'];
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
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
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
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
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
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
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  reorderCategories(@Body() orderData: { categoryId: number; sortOrder: number }[]) {
    return this.adminService.reorderCategories(orderData);
  }

  // Brand Management
  @Get('brands')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  getBrands() {
    return this.adminService.getBrands();
  }

  @Post('brands')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  createBrand(@Body() brandData: any) {
    return this.adminService.createBrand(brandData);
  }

  @Put('brands/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  updateBrand(@Param('id', ParseIntPipe) id: number, @Body() brandData: any) {
    return this.adminService.updateBrand(id, brandData);
  }

  @Delete('brands/:id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  deleteBrand(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteBrand(id);
  }

  // Additional admin endpoints for compatibility
  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('analytics')
  @UseGuards(AuthGuard('jwt'))
  getAnalytics() {
    return this.adminService.getDashboardStats();
  }

  // Promo Codes Management
  @Get('promo-codes')
  @UseGuards(AuthGuard('jwt'))
  getPromoCodes(@Query() query: any) {
    return this.adminService.getPromoCodes(query);
  }

  @Post('promo-codes')
  @UseGuards(AuthGuard('jwt'))
  createPromoCode(@Body() promoCodeData: any, @Req() req) {
    return this.adminService.createPromoCode(promoCodeData, req.user?.id);
  }

  @Post('promo-codes/validate')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  validatePromoCode(@Body() data: { code: string; orderAmount: number }, @Req() req) {
    return this.adminService.validatePromoCode(data.code, data.orderAmount, req.user?.id);
  }

  // Orders Management
  @Get('orders')
  @UseGuards(AuthGuard('jwt'))
  getOrders(@Query() query: any) {
    return this.adminService.getOrders(query);
  }

  // Customers Management  
  @Get('customers')
  @UseGuards(AuthGuard('jwt'))
  getCustomers(@Query() query: any) {
    return this.adminService.getCustomers(query);
  }
}
