"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsrfProtectionService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let CsrfProtectionService = class CsrfProtectionService {
    constructor() {
        this.tokenStore = new Map();
        this.tokenExpiry = 3600000;
    }
    generateToken(sessionId) {
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expires = Date.now() + this.tokenExpiry;
        this.tokenStore.set(sessionId, { token, expires });
        this.cleanupExpiredTokens();
        return token;
    }
    validateToken(sessionId, providedToken) {
        const storedData = this.tokenStore.get(sessionId);
        if (!storedData) {
            return false;
        }
        if (Date.now() > storedData.expires) {
            this.tokenStore.delete(sessionId);
            return false;
        }
        return this.constantTimeCompare(storedData.token, providedToken);
    }
    removeToken(sessionId) {
        this.tokenStore.delete(sessionId);
    }
    generateDoubleSubmitToken() {
        return (0, crypto_1.randomBytes)(32).toString('hex');
    }
    validateDoubleSubmitToken(cookieToken, headerToken) {
        if (!cookieToken || !headerToken) {
            return false;
        }
        return this.constantTimeCompare(cookieToken, headerToken);
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    constantTimeCompare(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return result === 0;
    }
    cleanupExpiredTokens() {
        const now = Date.now();
        for (const [sessionId, data] of this.tokenStore.entries()) {
            if (now > data.expires) {
                this.tokenStore.delete(sessionId);
            }
        }
    }
    getTokenInfo(sessionId) {
        const storedData = this.tokenStore.get(sessionId);
        if (!storedData) {
            return { exists: false };
        }
        return {
            exists: true,
            expires: storedData.expires
        };
    }
};
exports.CsrfProtectionService = CsrfProtectionService;
exports.CsrfProtectionService = CsrfProtectionService = __decorate([
    (0, common_1.Injectable)()
], CsrfProtectionService);
//# sourceMappingURL=csrf-protection.service.js.map