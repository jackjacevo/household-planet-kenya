import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileUploadService } from './file-upload.service';
import { RateLimit } from '../security/decorators/rate-limit.decorator';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @RateLimit({ ttl: 60000, limit: 10 })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
    @Query('category') category?: string,
    @Query('allowedTypes') allowedTypes?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedTypesArray = allowedTypes ? allowedTypes.split(',') : undefined;
    
    return this.fileUploadService.uploadFile(
      file,
      req.user.id,
      category || 'general',
      allowedTypesArray,
    );
  }

  @Post('upload-multiple')
  @RateLimit({ ttl: 60000, limit: 5 })
  @UseInterceptors(FilesInterceptor('files', 5))
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req: any,
    @Query('category') category?: string,
    @Query('allowedTypes') allowedTypes?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const allowedTypesArray = allowedTypes ? allowedTypes.split(',') : undefined;
    const results = [];

    for (const file of files) {
      const result = await this.fileUploadService.uploadFile(
        file,
        req.user.id,
        category || 'general',
        allowedTypesArray,
      );
      results.push(result);
    }

    return { files: results };
  }

  @Get()
  async getUserFiles(
    @Request() req: any,
    @Query('category') category?: string,
  ) {
    return this.fileUploadService.getUserFiles(req.user.id, category);
  }

  @Get(':id')
  async getFile(@Param('id') id: string, @Request() req: any) {
    return this.fileUploadService.getFileById(id, req.user.id);
  }

  @Delete(':id')
  @RateLimit({ ttl: 60000, limit: 20 })
  async deleteFile(@Param('id') id: string, @Request() req: any) {
    await this.fileUploadService.deleteFile(id, req.user.id);
    return { message: 'File deleted successfully' };
  }
}