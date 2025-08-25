import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BUSINESS_CONSTANTS } from '../common/constants/business.constants';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      limits: {
        fileSize: BUSINESS_CONSTANTS.FILE_UPLOAD.MAX_FILE_SIZE,
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
    }),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}