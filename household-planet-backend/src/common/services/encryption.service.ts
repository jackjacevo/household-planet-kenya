import { Injectable } from '@nestjs/common';
import { createCipher, createDecipher, randomBytes } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key = process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-12345';

  encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipher(this.algorithm, this.key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    const decipher = createDecipher(this.algorithm, this.key);
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
