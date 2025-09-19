import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { SeoService } from './seo.service';
import { SearchService } from './search.service';
import { ReviewSchemaService } from './review-schema.service';
import { ImageAltService } from './image-alt.service';
import { UrlOptimizerService } from './url-optimizer.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContentController],
  providers: [ContentService, SeoService, SearchService, ReviewSchemaService, ImageAltService, UrlOptimizerService],
  exports: [ContentService, SeoService, SearchService, ReviewSchemaService, ImageAltService, UrlOptimizerService],
})
export class ContentModule {}
