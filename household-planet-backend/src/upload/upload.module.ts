import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
