import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { ContentService } from './content.service';
import { SeoService } from './seo.service';
import { SearchService } from './search.service';
import { ReviewSchemaService } from './review-schema.service';
import { ImageAltService } from './image-alt.service';
import { UrlOptimizerService } from './url-optimizer.service';
import {
  CreateContentPageDto,
  UpdateContentPageDto,
  CreateBannerDto,
  UpdateBannerDto,
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  CreateFAQDto,
  UpdateFAQDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
} from './dto/content.dto';

@Controller('content')
export class ContentController {
  constructor(
    private contentService: ContentService,
    private seoService: SeoService,
    private searchService: SearchService,
    private reviewSchemaService: ReviewSchemaService,
    private imageAltService: ImageAltService,
    private urlOptimizerService: UrlOptimizerService
  ) {}

  // Public endpoints
  @Get('pages/:slug')
  async getPageBySlug(@Param('slug') slug: string) {
    return this.contentService.getPageBySlug(slug);
  }

  @Get('banners')
  async getBanners(@Query('position') position?: string) {
    return this.contentService.getBanners(position);
  }

  @Get('faqs')
  async getFAQs(@Query('category') category?: string) {
    return this.contentService.getFAQs(category);
  }

  @Get('faqs/categories')
  async getFAQCategories() {
    return this.contentService.getFAQCategories();
  }

  // Admin endpoints - Content Pages
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Post('pages')
  async createPage(@Body() createPageDto: CreateContentPageDto) {
    return this.contentService.createPage(createPageDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get('admin/pages')
  async getAllPages() {
    return this.contentService.getPages();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Put('pages/:id')
  async updatePage(@Param('id') id: string, @Body() updatePageDto: UpdateContentPageDto) {
    return this.contentService.updatePage(+id, updatePageDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('pages/:id')
  async deletePage(@Param('id') id: string) {
    return this.contentService.deletePage(+id);
  }

  // Admin endpoints - Banners
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Post('banners')
  async createBanner(@Body() createBannerDto: CreateBannerDto) {
    return this.contentService.createBanner(createBannerDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get('admin/banners')
  async getAllBanners() {
    return this.contentService.getAllBanners();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Put('banners/:id')
  async updateBanner(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return this.contentService.updateBanner(+id, updateBannerDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('banners/:id')
  async deleteBanner(@Param('id') id: string) {
    return this.contentService.deleteBanner(+id);
  }

  // Admin endpoints - Email Templates
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('email-templates')
  async createEmailTemplate(@Body() createTemplateDto: CreateEmailTemplateDto) {
    return this.contentService.createEmailTemplate(createTemplateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get('email-templates')
  async getEmailTemplates() {
    return this.contentService.getEmailTemplates();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get('email-templates/:name')
  async getEmailTemplate(@Param('name') name: string) {
    return this.contentService.getEmailTemplate(name);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('email-templates/:id')
  async updateEmailTemplate(@Param('id') id: string, @Body() updateTemplateDto: UpdateEmailTemplateDto) {
    return this.contentService.updateEmailTemplate(+id, updateTemplateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('email-templates/:id')
  async deleteEmailTemplate(@Param('id') id: string) {
    return this.contentService.deleteEmailTemplate(+id);
  }

  // Admin endpoints - FAQs
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Post('faqs')
  async createFAQ(@Body() createFAQDto: CreateFAQDto) {
    return this.contentService.createFAQ(createFAQDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get('admin/faqs')
  async getAllFAQs() {
    return this.contentService.getAllFAQs();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Put('faqs/:id')
  async updateFAQ(@Param('id') id: string, @Body() updateFAQDto: UpdateFAQDto) {
    return this.contentService.updateFAQ(+id, updateFAQDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('faqs/:id')
  async deleteFAQ(@Param('id') id: string) {
    return this.contentService.deleteFAQ(+id);
  }

  // Blog Posts endpoints
  @Get('blog')
  async getBlogPosts(@Query('published') published?: string) {
    const isPublished = published === 'true' ? true : published === 'false' ? false : undefined;
    return this.contentService.getBlogPosts(isPublished);
  }

  @Get('blog/:slug')
  async getBlogPostBySlug(@Param('slug') slug: string) {
    return this.contentService.getBlogPostBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Post('blog')
  async createBlogPost(@Body() createBlogPostDto: CreateBlogPostDto) {
    return this.contentService.createBlogPost(createBlogPostDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get('admin/blog')
  async getAllBlogPosts() {
    return this.contentService.getBlogPosts();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Put('blog/:id')
  async updateBlogPost(@Param('id') id: string, @Body() updateBlogPostDto: UpdateBlogPostDto) {
    return this.contentService.updateBlogPost(+id, updateBlogPostDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('blog/:id')
  async deleteBlogPost(@Param('id') id: string) {
    return this.contentService.deleteBlogPost(+id);
  }

  // SEO Optimization endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get('seo/product/:id')
  async optimizeProductSeo(@Param('id') id: string) {
    return this.seoService.optimizeProductDescription(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get('seo/category/:id')
  async optimizeCategorySeo(@Param('id') id: string) {
    return this.seoService.optimizeCategoryPage(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Get('review-schema/:productId')
  async getReviewSchema(@Param('productId') productId: string) {
    return this.reviewSchemaService.generateReviewSchema(+productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Post('optimize-image-alt')
  async optimizeImageAlt() {
    return this.imageAltService.bulkUpdateImageAlt();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @Post('optimize-urls')
  async optimizeUrls() {
    const [products, categories] = await Promise.all([
      this.urlOptimizerService.optimizeProductUrls(),
      this.urlOptimizerService.optimizeCategoryUrls()
    ]);
    return { products, categories };
  }

  // Search endpoints
  @Get('search')
  async searchProducts(
    @Query('q') query: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('userId') userId?: string
  ) {
    const filters = {
      categoryId: categoryId ? +categoryId : undefined,
      brandId: brandId ? +brandId : undefined,
      minPrice: minPrice ? +minPrice : undefined,
      maxPrice: maxPrice ? +maxPrice : undefined,
      sortBy,
      limit: limit ? +limit : 20,
      offset: offset ? +offset : 0
    };
    return this.searchService.searchProducts(query, filters, userId ? +userId : undefined);
  }

  @Get('search/suggestions')
  async getSearchSuggestions(@Query('q') query: string) {
    return this.searchService.getSearchSuggestions(query);
  }

  @Get('search/popular')
  async getPopularSearches() {
    return this.searchService.getPopularSearches();
  }

  @Get('search/filters')
  async getSearchFilters() {
    return this.searchService.getSearchFilters();
  }

  @Get('search/related')
  async getRelatedSearches(@Query('q') query: string) {
    return this.searchService.getRelatedSearches(query);
  }

  // Search Analytics (Admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('search/analytics')
  async getSearchAnalytics(@Query('days') days?: string) {
    return this.searchService.getSearchAnalytics(days ? +days : 30);
  }
}
