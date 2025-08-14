"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpsRedirectMiddleware = void 0;
const common_1 = require("@nestjs/common");
let HttpsRedirectMiddleware = class HttpsRedirectMiddleware {
    use(req, res, next) {
        if (process.env.NODE_ENV !== 'production') {
            return next();
        }
        const isHttps = req.secure ||
            req.headers['x-forwarded-proto'] === 'https' ||
            req.headers['x-forwarded-ssl'] === 'on';
        if (!isHttps) {
            const httpsUrl = `https://${req.get('host')}${req.originalUrl}`;
            return res.redirect(301, httpsUrl);
        }
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        res.setHeader('X-Forwarded-Proto', 'https');
        next();
    }
};
exports.HttpsRedirectMiddleware = HttpsRedirectMiddleware;
exports.HttpsRedirectMiddleware = HttpsRedirectMiddleware = __decorate([
    (0, common_1.Injectable)()
], HttpsRedirectMiddleware);
//# sourceMappingURL=https-redirect.middleware.js.map