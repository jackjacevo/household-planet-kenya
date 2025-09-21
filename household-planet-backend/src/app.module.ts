import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { ContentModule } from './content/content.module';
import { AdminModule } from './admin/admin.module';
import { ActivityModule } from './activity/activity.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { CartModule } from './cart/cart.module';
import { CustomersModule } from './customers/customers.module';
import { DeliveryModule } from './delivery/delivery.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SupportModule } from './support/support.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EmailModule } from './email/email.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { ReturnsModule } from './returns/returns.module';
import { StaffModule } from './staff/staff.module';
import { SettingsModule } from './settings/settings.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SetupModule } from './setup/setup.module';
import { UploadModule } from './upload/upload.module';
import { CleanupService } from './common/cleanup.service';
import { WebSocketGatewayService } from './websocket/websocket.gateway';
import { HealthController } from './health/health.controller';
import { TempAdminUpdateController } from './temp-admin-update.controller';
@Module({
  controllers: [HealthController, TempAdminUpdateController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    ContentModule,
    AdminModule,
    ActivityModule,
    OrdersModule,
    PaymentsModule,
    CartModule,
    CustomersModule,
    DeliveryModule,
    ReviewsModule,
    SupportModule,
    AnalyticsModule,
    EmailModule,
    LoyaltyModule,
    ReturnsModule,
    StaffModule,
    SettingsModule,
    WishlistModule,
    PromoCodesModule,
    NotificationsModule,
    SetupModule,
    UploadModule,
  ],
  providers: [CleanupService, WebSocketGatewayService],
})
export class AppModule {}
