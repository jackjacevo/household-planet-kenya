import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query, 
  UseGuards, UseInterceptors, UploadedFiles, UploadedFile, Res
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { BulkImportService } from './services/bulk-import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import * as XLSX from 'xlsx';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly bulkImportService: BulkImportService
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, {
    storage: diskStorage({
      destination: './uploads/products',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  create(@Body() createProductDto: CreateProductDto, @UploadedFiles() files: Express.Multer.File[]) {
    if (files && files.length > 0) {
      createProductDto.images = files.map(file => `/uploads/products/${file.filename}`);
    }
    return this.productsService.create(createProductDto);
  }

  @Public()
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('featured') featured?: string
  ) {
    return this.productsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      categoryId,
      featured === 'true'
    );
  }

  @Public()
  @Get('search')
  search(@Query() filters: SearchFiltersDto) {
    return this.productsService.advancedSearch(filters);
  }

  @Public()
  @Get('search/suggestions')
  getSearchSuggestions(@Query('q') query: string) {
    return this.productsService.getSearchSuggestions(query);
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string, @CurrentUser() user?: any) {
    return this.productsService.findBySlug(slug, user?.id);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.productsService.findOne(id, user?.id);
  }

  @Public()
  @Get(':id/related')
  getRelatedProducts(@Param('id') id: string) {
    return this.productsService.getRelatedProducts(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/view')
  trackView(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productsService.trackView(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('user/recently-viewed/:id')
  removeFromRecentlyViewed(@Param('id') productId: string, @CurrentUser() user: any) {
    return this.productsService.removeFromRecentlyViewed(user.id, productId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reviews')
  @UseInterceptors(FilesInterceptor('images', 5, {
    storage: diskStorage({
      destination: './uploads/reviews',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  createReview(
    @Param('id') productId: string,
    @CurrentUser() user: any,
    @Body() createReviewDto: CreateReviewDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    if (files && files.length > 0) {
      createReviewDto.images = files.map(file => `/uploads/reviews/${file.filename}`);
    }
    return this.productsService.createReview(productId, user.id, createReviewDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/recently-viewed')
  getRecentlyViewed(@CurrentUser() user: any) {
    return this.productsService.getRecentlyViewed(user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, {
    storage: diskStorage({
      destination: './uploads/products',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @UploadedFiles() files: Express.Multer.File[]) {
    if (files && files.length > 0) {
      updateProductDto.images = files.map(file => `/uploads/products/${file.filename}`);
    }
    return this.productsService.update(id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/variants')
  createVariant(@Param('id') productId: string, @Body() createVariantDto: CreateVariantDto) {
    return this.productsService.createVariant(productId, createVariantDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('variants/:variantId')
  updateVariant(@Param('variantId') variantId: string, @Body() updateData: Partial<CreateVariantDto>) {
    return this.productsService.updateVariant(variantId, updateData);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('variants/:variantId')
  removeVariant(@Param('variantId') variantId: string) {
    return this.productsService.removeVariant(variantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('bulk/prices')
  bulkUpdatePrices(@Body() updates: { id: string; price: number }[]) {
    return this.productsService.bulkUpdatePrices(updates);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('bulk/import/csv')
  @UseInterceptors(FileInterceptor('file'))
  async importCSV(@UploadedFile() file: Express.Multer.File) {
    return this.bulkImportService.importFromCSV(file.path);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('bulk/import/excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    return this.bulkImportService.importFromExcel(file.path);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('bulk/export/csv')
  async exportCSV(@Res() res: Response) {
    const data = await this.bulkImportService.exportToCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.send(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('bulk/export/excel')
  async exportExcel(@Res() res: Response) {
    const workbook = await this.bulkImportService.exportToExcel();
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
    res.send(buffer);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/stock')
  updateStock(
    @Param('id') productId: string,
    @Body() body: { variantId?: string; quantity: number; operation: 'add' | 'subtract' }
  ) {
    return this.productsService.updateStock(productId, body.variantId || null, body.quantity, body.operation);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('inventory/low-stock')
  getLowStockProducts() {
    return this.productsService.getLowStockProducts();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('inventory/alerts')
  getInventoryAlerts() {
    return this.productsService.getInventoryAlerts();
  }
}