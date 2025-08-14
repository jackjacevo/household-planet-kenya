import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { BlogService } from './blog.service';
import { SeoService } from './seo.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContentController],
  providers: [ContentService, BlogService, SeoService],
  exports: [ContentService, BlogService, SeoService],
})
export class ContentModule {}