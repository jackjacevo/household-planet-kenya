"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VirusScanService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirusScanService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let VirusScanService = VirusScanService_1 = class VirusScanService {
    constructor() {
        this.logger = new common_1.Logger(VirusScanService_1.name);
        this.clamAvEnabled = process.env.CLAMAV_ENABLED === 'true';
    }
    async scanFile(filePath) {
        if (!this.clamAvEnabled) {
            this.logger.warn('ClamAV scanning disabled - skipping virus scan');
            return true;
        }
        try {
            const suspiciousPatterns = await this.scanForSuspiciousPatterns(filePath);
            if (suspiciousPatterns) {
                this.logger.warn(`Suspicious patterns detected in file: ${filePath}`);
                return false;
            }
            if (await this.isClamAvAvailable()) {
                return await this.scanWithClamAV(filePath);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Virus scan failed for file ${filePath}:`, error);
            return false;
        }
    }
    async scanForSuspiciousPatterns(filePath) {
        try {
            const { stdout } = await execAsync(`type "${filePath}" | findstr /i "script eval exec"`);
            return stdout.length > 0;
        }
        catch {
            return false;
        }
    }
    async isClamAvAvailable() {
        try {
            await execAsync('clamscan --version');
            return true;
        }
        catch {
            return false;
        }
    }
    async scanWithClamAV(filePath) {
        try {
            const { stdout, stderr } = await execAsync(`clamscan --no-summary "${filePath}"`);
            if (stderr) {
                this.logger.error(`ClamAV scan error: ${stderr}`);
                return false;
            }
            return stdout.includes('OK') && !stdout.includes('FOUND');
        }
        catch (error) {
            this.logger.error(`ClamAV scan failed:`, error);
            return false;
        }
    }
    async quarantineFile(filePath) {
        const quarantinePath = filePath.replace('/uploads/', '/quarantine/');
        try {
            await execAsync(`move "${filePath}" "${quarantinePath}"`);
            this.logger.warn(`File quarantined: ${filePath} -> ${quarantinePath}`);
        }
        catch (error) {
            this.logger.error(`Failed to quarantine file ${filePath}:`, error);
        }
    }
};
exports.VirusScanService = VirusScanService;
exports.VirusScanService = VirusScanService = VirusScanService_1 = __decorate([
    (0, common_1.Injectable)()
], VirusScanService);
//# sourceMappingURL=virus-scan.service.js.map