import { Injectable, BadRequestException } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class VirusScannerService {
  async scanFile(filePath: string): Promise<void> {
    try {
      // ClamAV scan (install: apt-get install clamav-daemon)
      await execAsync(`clamscan --no-summary ${filePath}`);
    } catch (error) {
      if (error.code === 1) {
        throw new BadRequestException('File contains malware');
      }
      // Scanner not available, use basic validation
      await this.basicScan(filePath);
    }
  }

  private async basicScan(filePath: string): Promise<void> {
    const fs = require('fs/promises');
    const content = await fs.readFile(filePath);
    
    const threats = [
      /X5O!P%@AP\[4\\PZX54\(P\^\)7CC\)7\}\$EICAR/,
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /data:text\/html/gi,
    ];

    const text = content.toString();
    if (threats.some(pattern => pattern.test(text))) {
      throw new BadRequestException('Suspicious content detected');
    }
  }
}