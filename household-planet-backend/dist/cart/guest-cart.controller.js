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
exports.GuestCartController = void 0;
const common_1 = require("@nestjs/common");
const guest_cart_service_1 = require("./guest-cart.service");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let GuestCartController = class GuestCartController {
    constructor(guestCartService) {
        this.guestCartService = guestCartService;
    }
    validateGuestCart(body) {
        return this.guestCartService.validateGuestCart(body.items);
    }
};
exports.GuestCartController = GuestCartController;
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GuestCartController.prototype, "validateGuestCart", null);
exports.GuestCartController = GuestCartController = __decorate([
    (0, common_1.Controller)('guest-cart'),
    (0, public_decorator_1.Public)(),
    __metadata("design:paramtypes", [guest_cart_service_1.GuestCartService])
], GuestCartController);
//# sourceMappingURL=guest-cart.controller.js.map