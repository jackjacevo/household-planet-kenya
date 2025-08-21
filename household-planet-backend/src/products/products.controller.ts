import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe, UseInterceptors, UploadedFiles, UploadedFile, Req, Res } from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkUpdateDto } from './dto/bulk-update.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { BulkImportDto } from './dto/bulk-import.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { Response } from 'express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseInterceptors(FilesInterceptor('images', 10))
  create(@Body() createProductDto: CreateProductDto, @UploadedFiles() files: Express.Multer.File[]) {
    return this.productsService.create(createProductDto, files);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  bulkCreate(@Body() products: CreateProductDto[]) {
    return this.productsService.bulkCreate(products);
  }

  @Patch('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  bulkUpdate(@Body() bulkUpdateDto: BulkUpdateDto) {
    return this.productsService.bulkUpdate(bulkUpdateDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
    @Query('active') active?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string
  ) {
    return this.productsService.findAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      category,
      search,
      featured: featured === 'true',
      active: active !== 'false',
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder as 'asc' | 'desc' || 'desc'
    });
  }

  @Get('featured')
  getFeatured(@Query('limit') limit?: string) {
    return this.productsService.getFeatured(parseInt(limit) || 10);
  }

  @Get('search')
  search(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.productsService.search(query, parseInt(limit) || 20);
  }

  @Post('search/advanced')
  advancedSearch(@Body() filters: SearchFiltersDto) {
    return this.productsService.advancedSearch(filters);
  }

  @Get('search/autocomplete')
  getAutocomplete(@Query('q') query: string, @Query('limit') limit?: string) {
    return this.productsService.getAutocomplete(query, parseInt(limit) || 10);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.id;
    const sessionId = req.sessionID || req.headers['x-session-id'];
    return this.productsService.findOne(id, userId, sessionId);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string, @Req() req: any) {
    const userId = req.user?.id;
    const sessionId = req.sessionID || req.headers['x-session-id'];
    return this.productsService.findBySlug(slug, userId, sessionId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  @UseInterceptors(FilesInterceptor('images', 10))
  update(@Param('id', ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto, @UploadedFiles() files?: Express.Multer.File[]) {
    return this.productsService.update(id, updateProductDto, files);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  // Variant Management
  @Post(':id/variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  createVariant(@Param('id', ParseIntPipe) productId: number, @Body() createVariantDto: CreateVariantDto) {
    return this.productsService.createVariant(productId, createVariantDto);
  }

  @Patch('variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  updateVariant(@Param('variantId', ParseIntPipe) variantId: number, @Body() updateData: Partial<CreateVariantDto>) {
    return this.productsService.updateVariant(variantId, updateData);
  }

  @Delete('variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  deleteVariant(@Param('variantId', ParseIntPipe) variantId: number) {
    return this.productsService.deleteVariant(variantId);
  }

  // Recommendations
  @Get(':id/recommendations')
  getRecommendations(
    @Param('id', ParseIntPipe) productId: number,
    @Query('type') type?: 'RELATED' | 'SIMILAR' | 'FREQUENTLY_BOUGHT_TOGETHER',
    @Query('limit') limit?: string
  ) {
    return this.productsService.getRecommendations(productId, type, parseInt(limit) || 6);
  }

  @Post(':id/recommendations/generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  generateRecommendations(@Param('id', ParseIntPipe) productId: number) {
    return this.productsService.generateRecommendations(productId);
  }

  // Recently Viewed
  @Get('recently-viewed')
  getRecentlyViewed(@Req() req: any, @Query('limit') limit?: string) {
    const userId = req.user?.id;
    const sessionId = req.sessionID || req.headers['x-session-id'];
    return this.productsService.getRecentlyViewed(userId, sessionId, parseInt(limit) || 10);
  }

  @Get('user/recently-viewed')
  getUserRecentlyViewed(@Req() req: any, @Query('limit') limit?: string) {
    const userId = req.user?.id;
    const sessionId = req.sessionID || req.headers['x-session-id'];
    return this.productsService.getRecentlyViewed(userId, sessionId, parseInt(limit) || 10);
  }

  // Low Stock Management
  @Get('inventory/low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  getLowStockProducts(@Query('threshold') threshold?: string) {
    return this.productsService.getLowStockProducts(parseInt(threshold) || 5);
  }

  @Post('variants/:variantId/low-stock-alert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.STAFF)
  createLowStockAlert(
    @Param('variantId', ParseIntPipe) variantId: number,
    @Body('threshold') threshold: number
  ) {
    return this.productsService.createLowStockAlert(variantId, threshold);
  }

  // Bulk Import/Export
  @Post('import/csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  bulkImportCSV(@UploadedFile() file: Express.Multer.File, @Body() importDto: BulkImportDto) {
    return this.productsService.bulkImportFromCSV(file, importDto.userId);
  }

  @Get('export/csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async exportCSV(@Res() res: Response) {
    const data = await this.productsService.exportToCSV();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    
    const csvHeader = Object.keys(data[0] || {}).join(',');
    const csvRows = data.map(row => Object.values(row).join(','));
    const csvContent = [csvHeader, ...csvRows].join('\n');
    
    res.send(csvContent);
  }

  @Get('import/status/:jobId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  getImportJobStatus(@Param('jobId') jobId: string) {
    return this.productsService.getImportJobStatus(jobId);
  }
}