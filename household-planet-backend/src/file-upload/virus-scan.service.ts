import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class VirusScanService {
  private readonly logger = new Logger(VirusScanService.name);
  private readonly clamAvEnabled = process.env.CLAMAV_ENABLED === 'true';

  async scanFile(filePath: string): Promise<boolean> {
    if (!this.clamAvEnabled) {
      this.logger.warn('ClamAV scanning disabled - skipping virus scan');
      return true;
    }

    try {
      // Basic file content scanning for suspicious patterns
      const suspiciousPatterns = await this.scanForSuspiciousPatterns(filePath);
      if (suspiciousPatterns) {
        this.logger.warn(`Suspicious patterns detected in file: ${filePath}`);
        return false;
      }

      // If ClamAV is available, use it
      if (await this.isClamAvAvailable()) {
        return await this.scanWithClamAV(filePath);
      }

      return true;
    } catch (error) {
      this.logger.error(`Virus scan failed for file ${filePath}:`, error);
      // Fail secure - reject file if scan fails
      return false;
    }
  }

  private async scanForSuspiciousPatterns(filePath: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`type "${filePath}" | findstr /i "script eval exec"`);
      return stdout.length > 0;
    } catch {
      return false;
    }
  }

  private async isClamAvAvailable(): Promise<boolean> {
    try {
      await execAsync('clamscan --version');
      return true;
    } catch {
      return false;
    }
  }

  private async scanWithClamAV(filePath: string): Promise<boolean> {
    try {
      const { stdout, stderr } = await execAsync(`clamscan --no-summary "${filePath}"`);
      
      if (stderr) {
        this.logger.error(`ClamAV scan error: ${stderr}`);
        return false;
      }

      // ClamAV returns "OK" for clean files
      return stdout.includes('OK') && !stdout.includes('FOUND');
    } catch (error) {
      this.logger.error(`ClamAV scan failed:`, error);
      return false;
    }
  }

  async quarantineFile(filePath: string): Promise<void> {
    const quarantinePath = filePath.replace('/uploads/', '/quarantine/');
    try {
      await execAsync(`move "${filePath}" "${quarantinePath}"`);
      this.logger.warn(`File quarantined: ${filePath} -> ${quarantinePath}`);
    } catch (error) {
      this.logger.error(`Failed to quarantine file ${filePath}:`, error);
    }
  }
}