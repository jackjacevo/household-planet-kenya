import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { FileValidationService } from './file-validation.service';
import { FileStorageService } from './file-storage.service';
import { VirusScanService } from './virus-scan.service';
import { ImageOptimizationService } from './image-optimization.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 5,
      },
    }),
  ],
  controllers: [FileUploadController],
  providers: [
    FileUploadService,
    FileValidationService,
    FileStorageService,
    VirusScanService,
    ImageOptimizationService,
  ],
  exports: [FileUploadService, FileValidationService, FileStorageService],
})
export class FileUploadModule {}