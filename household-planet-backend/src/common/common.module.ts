import { Module } from '@nestjs/common';
import { AppLogger } from './services/logger.service';
import { SecureUploadService } from './services/secure-upload.service';

@Module({
  providers: [AppLogger, SecureUploadService],
  exports: [AppLogger, SecureUploadService],
})
export class CommonModule {}
