"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireEmailVerification = exports.REQUIRE_EMAIL_VERIFICATION = void 0;
const common_1 = require("@nestjs/common");
exports.REQUIRE_EMAIL_VERIFICATION = 'requireEmailVerification';
const RequireEmailVerification = () => (0, common_1.SetMetadata)(exports.REQUIRE_EMAIL_VERIFICATION, true);
exports.RequireEmailVerification = RequireEmailVerification;
//# sourceMappingURL=email-verified.decorator.js.map