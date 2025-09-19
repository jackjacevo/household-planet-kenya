import { Injectable } from '@nestjs/common';

@Injectable()
export class CdnService {
  private readonly cdnUrl = process.env.CDN_URL || '';

  async uploadToCdn(filePath: string, filename: string): Promise<string> {
    if (!this.cdnUrl) return filePath;

    // AWS S3/CloudFront integration
    try {
      // const AWS = require('aws-sdk');
      // const s3 = new AWS.S3();
      // Upload logic here
      return `${this.cdnUrl}/${filename}`;
    } catch {
      return filePath; // Fallback to local storage
    }
  }

  generateSecureUrl(filename: string, userId: string, expiresIn = 3600): string {
    const timestamp = Date.now() + (expiresIn * 1000);
    const token = require('crypto')
      .createHmac('sha256', process.env.CDN_SECRET || 'secret')
      .update(`${userId}:${filename}:${timestamp}`)
      .digest('hex');
    
    return `/api/upload/secure/${userId}/${filename}?token=${token}&expires=${timestamp}`;
  }
}
