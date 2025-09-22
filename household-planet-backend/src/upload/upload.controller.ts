import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile,
  UploadedFiles, 
  Request, 
  Param, 
  Res,
  NotFoundException,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

import { resolve, basename } from 'path';
import { SecureUploadService } from '../common/services/secure-upload.service';
import { AppLogger } from '../common/services/logger.service';
import { FileUploadGuard } from './guards/file-upload.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { RateLimit } from '../common/decorators/rate-limit.decorator';

@Controller('upload')
@UseGuards(AuthGuard('jwt'), RateLimitGuard)
export class UploadController {
  private readonly logger = new AppLogger(UploadController.name);
  
  constructor(private secureUpload: SecureUploadService) {}

  @Post()
  @RateLimit(10, 60000)
  @UseGuards(FileUploadGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      
      this.logger.log(`File upload attempt by user ${req.user?.userId}`);
      return await this.secureUpload.uploadFile(file, 'user-uploads');
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('product')
  @RateLimit(10, 60000)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(@UploadedFile() file: Express.Multer.File, @Request() req) {
    try {
      console.log('🔍 Upload product endpoint called');
      console.log('📁 File received:', file ? { name: file.originalname, size: file.size, type: file.mimetype } : 'No file');
      console.log('👤 User:', req.user ? { id: req.user.userId, email: req.user.email } : 'No user');
      
      if (!file) {
        console.log('❌ No file uploaded');
        throw new BadRequestException('No file uploaded');
      }
      
      this.logger.log(`Product image upload by user ${req.user?.userId}`);
      const result = await this.secureUpload.uploadFile(file, 'products');
      console.log('✅ Upload successful:', result);
      return { 
        success: true,
        url: typeof result === 'string' ? result : (result as any).url,
        message: 'Image uploaded successfully'
      };
    } catch (error) {
      console.error('❌ Product image upload failed:', error);
      this.logger.error(`Product image upload failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('products')
  @RateLimit(10, 60000)
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadProductImages(@UploadedFiles() files: Express.Multer.File[], @Request() req) {
    try {
      console.log('🔍 Upload products endpoint called');
      console.log('📁 Files received:', files ? files.map(f => ({ name: f.originalname, size: f.size, type: f.mimetype })) : 'No files');
      console.log('👤 User:', req.user ? { id: req.user.userId, email: req.user.email } : 'No user');
      
      if (!files || files.length === 0) {
        console.log('❌ No files uploaded');
        throw new BadRequestException('No files uploaded');
      }
      
      this.logger.log(`Product images upload by user ${req.user?.userId}, ${files.length} files`);
      
      const uploadPromises = files.map(file => 
        this.secureUpload.uploadFile(file, 'products')
      );
      
      const results = await Promise.all(uploadPromises);
      const images = results.map(result => typeof result === 'string' ? result : (result as any).url);
      
      console.log('✅ Upload successful:', images);
      return { 
        success: true,
        images,
        message: `Successfully uploaded ${images.length} image(s)`
      };
    } catch (error) {
      console.error('❌ Product images upload failed:', error);
      this.logger.error(`Product images upload failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('category')
  @RateLimit(10, 60000)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCategoryImage(@UploadedFile() file: Express.Multer.File, @Request() req) {
    try {
      console.log('🔍 Upload category endpoint called');
      console.log('📁 File received:', file ? { name: file.originalname, size: file.size, type: file.mimetype } : 'No file');
      
      if (!file) {
        console.log('❌ No file uploaded');
        throw new BadRequestException('No file uploaded');
      }
      
      this.logger.log(`Category image upload by user ${req.user?.userId}`);
      const result = await this.secureUpload.uploadFile(file, 'categories');
      console.log('✅ Category upload successful:', result);
      return { 
        success: true,
        url: typeof result === 'string' ? result : (result as any).url,
        message: 'Category image uploaded successfully'
      };
    } catch (error) {
      console.error('❌ Category image upload failed:', error);
      this.logger.error(`Category image upload failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('category-image')
  @RateLimit(10, 60000)
  @UseGuards(FileUploadGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadCategoryImageAlt(@UploadedFile() file: Express.Multer.File, @Request() req) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      
      this.logger.log(`Category image upload (alt) by user ${req.user?.userId}`);
      const result = await this.secureUpload.uploadFile(file, 'categories');
      return { url: typeof result === 'string' ? result : (result as any).url };
    } catch (error) {
      this.logger.error(`Category image upload (alt) failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('images')
  @RateLimit(5, 60000)
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[], @Request() req) {
    try {
      console.log('🔍 Upload images endpoint called');
      console.log('📁 Files received:', files ? files.map(f => ({ name: f.originalname, size: f.size, type: f.mimetype })) : 'No files');
      
      if (!files || files.length === 0) {
        console.log('❌ No images uploaded');
        throw new BadRequestException('No images uploaded');
      }
      
      this.logger.log(`Multiple image upload attempt by user ${req.user?.userId}, ${files.length} files`);
      
      const uploadPromises = files.map(file => 
        this.secureUpload.uploadFile(file, 'products')
      );
      
      const results = await Promise.all(uploadPromises);
      const images = results.map(result => typeof result === 'string' ? result : (result as any).url);
      
      console.log('✅ Multiple images upload successful:', images);
      return { 
        success: true,
        images,
        message: `Successfully uploaded ${images.length} image(s)`
      };
    } catch (error) {
      console.error('❌ Multiple image upload failed:', error);
      this.logger.error(`Multiple image upload failed: ${error.message}`, error.stack);
      throw error;
    }
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

    // Sanitize inputs to prevent path traversal
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-_]/g, '');
    const sanitizedFilename = basename(filename).replace(/[^a-zA-Z0-9.-_]/g, '');
    
    // Validate filename doesn't contain path traversal sequences
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      this.logger.logSecurityEvent('Path traversal attempt', { userId, filename });
      throw new NotFoundException('File not found');
    }

    const baseDir = resolve('./secure-uploads', sanitizedUserId);
    const filePath = resolve(baseDir, sanitizedFilename);
    
    // Ensure the resolved path is within the user's directory
    if (!filePath.startsWith(baseDir)) {
      this.logger.logSecurityEvent('Directory traversal attempt', { userId, filename, filePath });
      throw new NotFoundException('File not found');
    }
  
    res.sendFile(filePath, (err) => {
      if (err) {
        this.logger.logFileOperation('access', filename, false);
        throw new NotFoundException('File not found');
      } else {
        this.logger.logFileOperation('access', sanitizedFilename, true);
      }
    });
  }

  @Delete(':filename')
  async deleteFile(@Param('filename') filename: string, @Request() req) {
    // File deletion logic would go here
    return { message: 'File deletion not implemented yet' };
    return { message: 'File deleted successfully' };
  }
}
