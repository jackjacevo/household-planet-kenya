"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipCsrf = exports.SKIP_CSRF_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.SKIP_CSRF_KEY = 'skipCsrf';
const SkipCsrf = () => (0, common_1.SetMetadata)(exports.SKIP_CSRF_KEY, true);
exports.SkipCsrf = SkipCsrf;
//# sourceMappingURL=skip-csrf.decorator.js.map