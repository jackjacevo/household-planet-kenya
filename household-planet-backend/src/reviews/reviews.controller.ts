import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe, Req, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto, ReviewQueryDto } from './dto/review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 3, {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
  }))
  create(
    @Req() req: any, 
    @Body() createReviewDto: CreateReviewDto,
    @UploadedFiles() images?: Express.Multer.File[]
  ) {
    return this.reviewsService.create(req.user.id, createReviewDto, images);
  }

  @Get()
  findAll(@Query() query: ReviewQueryDto) {
    return this.reviewsService.findAll(query);
  }

  @Get('product/:productId')
  findByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.reviewsService.findByProduct(
      productId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10
    );
  }

  @Get('product/:productId/stats')
  getProductStats(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.getProductRatingStats(productId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() updateReviewDto: UpdateReviewDto
  ) {
    return this.reviewsService.update(id, req.user.id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
    return this.reviewsService.remove(id, req.user.id, isAdmin);
  }
}
