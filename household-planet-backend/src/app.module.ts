import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { DeliveryModule } from './delivery/delivery.module';
import { SupportModule } from './support/support.module';
import { AdminModule } from './admin/admin.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { ChatModule } from './chat/chat.module';
import { EmailModule } from './email/email.module';
import { SmsModule } from './sms/sms.module';
import { ContentModule } from './content/content.module';
import { AbTestingModule } from './ab-testing/ab-testing.module';
import { SecurityModule } from './security/security.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { ApiSecurityModule } from './api-security/api-security.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { SecurityGuard } from './security/guards/security.guard';
import { CsrfGuard } from './security/guards/csrf.guard';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ScheduleModule.forRoot(),
    SecurityModule,
    FileUploadModule,
    ApiSecurityModule,
    PrismaModule, 
    AuthModule, 
    UsersModule, 
    CategoriesModule, 
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    DeliveryModule,
    SupportModule,
    AdminModule,
    WhatsAppModule,
    ChatModule,
    EmailModule,
    SmsModule,
    ContentModule,
    AbTestingModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: SecurityGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
})
export class AppModule {}