"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const helmet_1 = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");
const security_headers_interceptor_1 = require("./security/interceptors/security-headers.interceptor");
const cors_config_service_1 = require("./api-security/cors-config.service");
const https_redirect_middleware_1 = require("./security/https-redirect.middleware");
async function bootstrap() {
    if (process.env.NODE_ENV === 'production' && !process.env.SSL_KEY_PATH) {
        throw new Error('SSL certificates required in production. Set SSL_KEY_PATH and SSL_CERT_PATH environment variables.');
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        httpsOptions: process.env.NODE_ENV === 'production' ? {
            key: require('fs').readFileSync(process.env.SSL_KEY_PATH || '/etc/ssl/private/server.key'),
            cert: require('fs').readFileSync(process.env.SSL_CERT_PATH || '/etc/ssl/certs/server.crt'),
        } : undefined,
    });
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com', 'https://checkout.flutterwave.com'],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'", 'https://api.stripe.com', 'https://api.flutterwave.com'],
                frameSrc: ['https://js.stripe.com', 'https://checkout.flutterwave.com'],
                objectSrc: ["'none'"],
                baseUri: ["'self'"],
                formAction: ["'self'"]
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    }));
    app.use(compression());
    app.use(cookieParser());
    app.use(hpp());
    const corsConfig = app.get(cors_config_service_1.CorsConfigService);
    app.enableCors(corsConfig.getCorsOptions());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
        validateCustomDecorators: true,
    }));
    app.useGlobalInterceptors(new security_headers_interceptor_1.SecurityHeadersInterceptor());
    if (process.env.NODE_ENV === 'production') {
        app.getHttpAdapter().getInstance().set('trust proxy', 1);
        const httpsRedirect = new https_redirect_middleware_1.HttpsRedirectMiddleware();
        app.use(httpsRedirect.use.bind(httpsRedirect));
        app.use((req, res, next) => {
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
            next();
        });
    }
    const port = process.env.PORT || 3001;
    await app.listen(port);
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    console.log(`Backend running on ${protocol}://localhost:${port}`);
    console.log('Security features enabled:');
    console.log('- HTTPS enforcement (production)');
    console.log('- Enhanced CSRF protection with double-submit cookies');
    console.log('- Security headers (Helmet + custom)');
    console.log('- Rate limiting with IP tracking');
    console.log('- Input validation & sanitization');
    console.log('- Log injection prevention');
    console.log('- XSS protection');
    console.log('- SQL injection protection');
    console.log('- File upload security');
    console.log('- API request logging with sanitization');
    console.log('- API versioning support');
    console.log('- Origin validation for API requests');
}
bootstrap();
//# sourceMappingURL=main.js.map