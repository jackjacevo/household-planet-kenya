"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsrfService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
let CsrfService = class CsrfService {
    constructor() {
        this.tokenStore = new Map();
        this.tokenExpiry = 3600000;
    }
    generateToken(sessionId) {
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + this.tokenExpiry);
        this.tokenStore.set(sessionId, { token, expires });
        this.cleanupExpiredTokens();
        return token;
    }
    validateToken(sessionId, providedToken) {
        const storedData = this.tokenStore.get(sessionId);
        if (!storedData) {
            return false;
        }
        if (storedData.expires < new Date()) {
            this.tokenStore.delete(sessionId);
            return false;
        }
        return crypto.timingSafeEqual(Buffer.from(storedData.token), Buffer.from(providedToken));
    }
    invalidateToken(sessionId) {
        this.tokenStore.delete(sessionId);
    }
    cleanupExpiredTokens() {
        const now = new Date();
        for (const [sessionId, data] of this.tokenStore.entries()) {
            if (data.expires < now) {
                this.tokenStore.delete(sessionId);
            }
        }
    }
};
exports.CsrfService = CsrfService;
exports.CsrfService = CsrfService = __decorate([
    (0, common_1.Injectable)()
], CsrfService);
//# sourceMappingURL=csrf.service.js.map