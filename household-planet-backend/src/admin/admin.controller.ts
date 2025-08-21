import { Controller, Get, Post, Put, Delete, Query, Body, Param, UseGuards, UseInterceptors, UploadedFiles, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FilesInterceptor('file'))
  importProductsCsv(@UploadedFiles() files: Express.Multer.File[]) {
    return this.adminService.importProductsCsv(files[0]);
  }

  @Get('products/export/csv')
  exportProductsCsv() {
    return this.adminService.exportProductsCsv();
  }

  @Post('products/:id/images')
  @UseInterceptors(FilesInterceptor('images', 10))
  uploadProductImages(@Param('id', ParseIntPipe) id: number, @UploadedFiles() files: Express.Multer.File[]) {
    return this.adminService.uploadProductImages(id, files);
  }

  @Post('products/images/crop')
  cropProductImage(@Body() cropDto: ImageCropDto) {
    return this.adminService.cropProductImage(cropDto);
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
  @UseInterceptors(FilesInterceptor('file'))
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