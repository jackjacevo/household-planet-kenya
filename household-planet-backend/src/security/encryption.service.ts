import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private readonly encryptionKey: Buffer;

  constructor() {
    const key = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32-chars';
    this.encryptionKey = crypto.scryptSync(key, 'salt', this.keyLength);
  }

  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
      cipher.setAAD(Buffer.from('household-planet-kenya'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  decrypt(encryptedData: string): string {
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
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  encryptSensitiveData(data: any): string {
    const jsonString = JSON.stringify(data);
    return this.encrypt(jsonString);
  }

  decryptSensitiveData<T>(encryptedData: string): T {
    const decryptedString = this.decrypt(encryptedData);
    return JSON.parse(decryptedString);
  }

  hashPassword(password: string, saltRounds: number = 12): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, crypto.randomBytes(16), saltRounds * 1000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString('hex'));
      });
    });
  }

  verifyPassword(password: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, storedHash] = hash.split(':');
      crypto.pbkdf2(password, Buffer.from(salt, 'hex'), 12000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), derivedKey));
      });
    });
  }

  generateSecureSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  encryptCreditCard(cardNumber: string): string {
    // Only encrypt, never store full card numbers
    const maskedNumber = cardNumber.slice(0, 4) + '*'.repeat(cardNumber.length - 8) + cardNumber.slice(-4);
    return this.encrypt(maskedNumber);
  }

  tokenizeData(data: string): string {
    const hash = crypto.createHash('sha256').update(data + process.env.JWT_SECRET).digest('hex');
    return hash.substring(0, 16);
  }
}