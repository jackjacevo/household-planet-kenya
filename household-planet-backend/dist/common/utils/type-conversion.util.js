"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureStringUserId = ensureStringUserId;
exports.ensureNumberUserId = ensureNumberUserId;
function ensureStringUserId(userId) {
    if (userId === undefined || userId === null) {
        throw new Error('UserId is required');
    }
    return String(userId);
}
function ensureNumberUserId(userId) {
    if (userId === undefined || userId === null) {
        throw new Error('UserId is required');
    }
    const numericId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    if (isNaN(numericId)) {
        throw new Error('Invalid userId format');
    }
    return numericId;
}
//# sourceMappingURL=type-conversion.util.js.map