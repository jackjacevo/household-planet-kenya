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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialUserDto = exports.SocialLoginDto = exports.SocialProvider = void 0;
const class_validator_1 = require("class-validator");
var SocialProvider;
(function (SocialProvider) {
    SocialProvider["GOOGLE"] = "google";
    SocialProvider["FACEBOOK"] = "facebook";
    SocialProvider["APPLE"] = "apple";
})(SocialProvider || (exports.SocialProvider = SocialProvider = {}));
class SocialLoginDto {
}
exports.SocialLoginDto = SocialLoginDto;
__decorate([
    (0, class_validator_1.IsEnum)(SocialProvider),
    __metadata("design:type", String)
], SocialLoginDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialLoginDto.prototype, "accessToken", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialLoginDto.prototype, "idToken", void 0);
class SocialUserDto {
}
exports.SocialUserDto = SocialUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialUserDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SocialUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialUserDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialUserDto.prototype, "avatar", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(SocialProvider),
    __metadata("design:type", String)
], SocialUserDto.prototype, "provider", void 0);
//# sourceMappingURL=social-login.dto.js.map