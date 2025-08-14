import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { BlogService } from './blog.service';
import { SeoService } from './seo.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/content')
export class ContentController {
  constructor(
    private contentService: ContentService,
    private blogService: BlogService,
    private seoService: SeoService,
  ) {}

  // Public endpoints
  @Public()
  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('type') type?: 'product' | 'blog' | 'page',
    @Query('category') category?: string,
    @Query('limit') limit?: string,
  ) {
    return this.contentService.searchContent(query, {
      type,
      category,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Public()
  @Get('blog')
  async getBlogPosts(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status = 'PUBLISHED',
  ) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    return this.blogService.getPosts({
      skip,
      take: parseInt(limit),
      status,
    });
  }

  @Public()
  @Get('blog/:slug')
  async getBlogPost(@Param('slug') slug: string) {
    return this.blogService.getPostBySlug(slug);
  }

  @Public()
  @Get('faqs')
  async getFAQs(@Query('category') category?: string) {
    return this.contentService.getFAQs(category);
  }

  @Public()
  @Get('page/:slug')
  async getPage(@Param('slug') slug: string) {
    return this.contentService.getPageBySlug(slug);
  }

  @Public()
  @Get('sitemap.xml')
  async getSitemap() {
    const sitemap = await this.seoService.generateSitemap();
    return { sitemap, contentType: 'application/xml' };
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post('blog')
  async createBlogPost(@Body() data: any) {
    return this.blogService.createPost(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post('faqs')
  async createFAQ(@Body() data: any) {
    return this.contentService.createFAQ(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post('pages')
  async createPage(@Body() data: any) {
    return this.contentService.createPage(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('optimize-seo')
  async optimizeAllContent() {
    return this.contentService.optimizeAllContent();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('product/:id/optimize-seo')
  async optimizeProductSEO(@Param('id') productId: string) {
    const result = await this.seoService.optimizeProductSEO(productId);
    if (!result) {
      return { error: 'Product not found' };
    }
    return { message: 'Product SEO optimized successfully', data: result };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('category/:id/generate-content')
  async generateCategoryContent(@Param('id') categoryId: string) {
    const result = await this.seoService.generateCategoryContent(categoryId);
    if (!result) {
      return { error: 'Category not found' };
    }
    return { message: 'Category content generated successfully', data: result };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('analytics/search')
  async getSearchAnalytics(@Query('days') days?: string) {
    return this.contentService.getSearchAnalytics(
      days ? parseInt(days) : undefined,
    );
  }
}