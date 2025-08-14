"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsrfController = void 0;
const common_1 = require("@nestjs/common");
const csrf_protection_service_1 = require("./csrf-protection.service");
const skip_csrf_decorator_1 = require("./decorators/skip-csrf.decorator");
let CsrfController = class CsrfController {
    constructor(csrfService) {
        this.csrfService = csrfService;
    }
    getToken(request, response) {
        const sessionId = request.session?.id || request.cookies?.sessionId;
        if (!sessionId) {
            return response.status(400).json({ error: 'Session required' });
        }
        const token = this.csrfService.generateToken(sessionId);
        const doubleSubmitToken = this.csrfService.generateDoubleSubmitToken();
        response.cookie('csrf-token', doubleSubmitToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        });
        return response.json({
            csrfToken: token,
            doubleSubmitToken
        });
    }
};
exports.CsrfController = CsrfController;
__decorate([
    (0, common_1.Get)('token'),
    (0, skip_csrf_decorator_1.SkipCsrf)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CsrfController.prototype, "getToken", null);
exports.CsrfController = CsrfController = __decorate([
    (0, common_1.Controller)('csrf'),
    __metadata("design:paramtypes", [csrf_protection_service_1.CsrfProtectionService])
], CsrfController);
//# sourceMappingURL=csrf.controller.js.map