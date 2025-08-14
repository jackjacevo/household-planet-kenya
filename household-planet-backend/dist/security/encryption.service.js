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
exports.EncryptionService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
let EncryptionService = class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.tagLength = 16;
        const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32-chars';
        this.encryptionKey = crypto.scryptSync(key, 'salt', this.keyLength);
    }
    encrypt(text) {
        try {
            const iv = crypto.randomBytes(this.ivLength);
            const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
            cipher.setAAD(Buffer.from('household-planet-kenya'));
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            const tag = cipher.getAuthTag();
            return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
        }
        catch (error) {
            throw new Error('Encryption failed');
        }
    }
    decrypt(encryptedData) {
        try {
            const parts = encryptedData.split(':');
            if (parts.length !== 3) {
                throw new Error('Invalid encrypted data format');
            }
            const iv = Buffer.from(parts[0], 'hex');
            const tag = Buffer.from(parts[1], 'hex');
            const encrypted = parts[2];
            const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
            decipher.setAAD(Buffer.from('household-planet-kenya'));
            decipher.setAuthTag(tag);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            throw new Error('Decryption failed');
        }
    }
    encryptSensitiveData(data) {
        const jsonString = JSON.stringify(data);
        return this.encrypt(jsonString);
    }
    decryptSensitiveData(encryptedData) {
        const decryptedString = this.decrypt(encryptedData);
        return JSON.parse(decryptedString);
    }
    hashPassword(password, saltRounds = 12) {
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(password, crypto.randomBytes(16), saltRounds * 1000, 64, 'sha512', (err, derivedKey) => {
                if (err)
                    reject(err);
                resolve(derivedKey.toString('hex'));
            });
        });
    }
    verifyPassword(password, hash) {
        return new Promise((resolve, reject) => {
            const [salt, storedHash] = hash.split(':');
            crypto.pbkdf2(password, Buffer.from(salt, 'hex'), 12000, 64, 'sha512', (err, derivedKey) => {
                if (err)
                    reject(err);
                resolve(crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), derivedKey));
            });
        });
    }
    generateSecureSessionId() {
        return crypto.randomBytes(32).toString('hex');
    }
    encryptCreditCard(cardNumber) {
        const maskedNumber = cardNumber.slice(0, 4) + '*'.repeat(cardNumber.length - 8) + cardNumber.slice(-4);
        return this.encrypt(maskedNumber);
    }
    tokenizeData(data) {
        const hash = crypto.createHash('sha256').update(data + process.env.JWT_SECRET).digest('hex');
        return hash.substring(0, 16);
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EncryptionService);
//# sourceMappingURL=encryption.service.js.map