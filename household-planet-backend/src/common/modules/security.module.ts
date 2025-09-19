import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ApiDocumentationService } from '../services/api-documentation.service';
import { SecurityDocsController } from '../controllers/security-docs.controller';
import { EnhancedAuthGuard } from '../guards/enhanced-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  controllers: [SecurityDocsController],
  providers: [
    ApiDocumentationService,
    EnhancedAuthGuard,
  ],
  exports: [
    ApiDocumentationService,
    EnhancedAuthGuard,
  ],
})
export class CommonSecurityModule {}
