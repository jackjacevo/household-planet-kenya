"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const file_upload_service_1 = require("./file-upload.service");
const file_upload_controller_1 = require("./file-upload.controller");
const file_validation_service_1 = require("./file-validation.service");
const file_storage_service_1 = require("./file-storage.service");
const virus_scan_service_1 = require("./virus-scan.service");
const image_optimization_service_1 = require("./image-optimization.service");
const multer_1 = require("multer");
const path_1 = require("path");
let FileUploadModule = class FileUploadModule {
};
exports.FileUploadModule = FileUploadModule;
exports.FileUploadModule = FileUploadModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: './uploads/temp',
                    filename: (req, file, callback) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                        callback(null, file.fieldname + '-' + uniqueSuffix + (0, path_1.extname)(file.originalname));
                    },
                }),
                limits: {
                    fileSize: 10 * 1024 * 1024,
                    files: 5,
                },
            }),
        ],
        controllers: [file_upload_controller_1.FileUploadController],
        providers: [
            file_upload_service_1.FileUploadService,
            file_validation_service_1.FileValidationService,
            file_storage_service_1.FileStorageService,
            virus_scan_service_1.VirusScanService,
            image_optimization_service_1.ImageOptimizationService,
        ],
        exports: [file_upload_service_1.FileUploadService, file_validation_service_1.FileValidationService, file_storage_service_1.FileStorageService],
    })
], FileUploadModule);
//# sourceMappingURL=file-upload.module.js.map