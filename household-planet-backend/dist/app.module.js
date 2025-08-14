"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const serve_static_1 = require("@nestjs/serve-static");
const schedule_1 = require("@nestjs/schedule");
const path_1 = require("path");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const categories_module_1 = require("./categories/categories.module");
const products_module_1 = require("./products/products.module");
const cart_module_1 = require("./cart/cart.module");
const orders_module_1 = require("./orders/orders.module");
const payments_module_1 = require("./payments/payments.module");
const delivery_module_1 = require("./delivery/delivery.module");
const support_module_1 = require("./support/support.module");
const admin_module_1 = require("./admin/admin.module");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
const chat_module_1 = require("./chat/chat.module");
const email_module_1 = require("./email/email.module");
const sms_module_1 = require("./sms/sms.module");
const content_module_1 = require("./content/content.module");
const ab_testing_module_1 = require("./ab-testing/ab-testing.module");
const security_module_1 = require("./security/security.module");
const file_upload_module_1 = require("./file-upload/file-upload.module");
const api_security_module_1 = require("./api-security/api-security.module");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const security_guard_1 = require("./security/guards/security.guard");
const csrf_guard_1 = require("./security/guards/csrf.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            schedule_1.ScheduleModule.forRoot(),
            security_module_1.SecurityModule,
            file_upload_module_1.FileUploadModule,
            api_security_module_1.ApiSecurityModule,
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            categories_module_1.CategoriesModule,
            products_module_1.ProductsModule,
            cart_module_1.CartModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            delivery_module_1.DeliveryModule,
            support_module_1.SupportModule,
            admin_module_1.AdminModule,
            whatsapp_module_1.WhatsAppModule,
            chat_module_1.ChatModule,
            email_module_1.EmailModule,
            sms_module_1.SmsModule,
            content_module_1.ContentModule,
            ab_testing_module_1.AbTestingModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: security_guard_1.SecurityGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: csrf_guard_1.CsrfGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map