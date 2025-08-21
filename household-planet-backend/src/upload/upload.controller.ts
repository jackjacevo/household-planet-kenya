import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  Request, 
  Param, 
  Res,
  NotFoundException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs/promises';
import { UploadService } from './upload.service';
import { FileUploadGuard } from './guards/file-upload.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { RateLimit } from '../common/decorators/rate-limit.decorator';

@Controller('upload')
@UseGuards(AuthGuard('jwt'), RateLimitGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post()
  @RateLimit(10, 60000) // 10 uploads per minute
  @UseGuards(FileUploadGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    return this.uploadService.upload(file, 'user-uploads');
  }

  @Get('secure/:userId/:filename')
  async getSecureFile(
    @Param('userId') userId: string,
    @Param('filename') filename: string,
    @Request() req,
    @Res() res: Response,
  ) {
    // Only allow users to access their own files
    if (req.user.userId !== userId) {
      throw new NotFoundException('File not found');
    }

    const filePath = path.join('./secure-uploads', userId, filename);
    
    try {
      await fs.access(filePath);
      res.sendFile(path.resolve(filePath));
    } catch {
      throw new NotFoundException('File not found');
    }
  }

  @Delete(':filename')
  async deleteFile(@Param('filename') filename: string, @Request() req) {
    // File deletion logic would go here
    return { message: 'File deletion not implemented yet' };
    return { message: 'File deleted successfully' };
  }
}