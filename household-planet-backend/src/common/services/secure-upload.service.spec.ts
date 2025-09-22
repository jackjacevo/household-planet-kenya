import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SecureUploadService } from './secure-upload.service';
import { promises as fs } from 'fs';
import { join } from 'path';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
  },
}));

describe('SecureUploadService', () => {
  let service: SecureUploadService;
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecureUploadService],
    }).compile();

    service = module.get<SecureUploadService>(SecureUploadService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    const createMockFile = (
      originalname: string,
      buffer: Buffer,
      size: number,
      mimetype: string = 'image/jpeg'
    ): Express.Multer.File => ({
      originalname,
      buffer,
      size,
      mimetype,
      fieldname: 'file',
      encoding: '7bit',
      filename: originalname,
      destination: '',
      path: '',
      stream: null,
    });

    beforeEach(() => {
      mockFs.access.mockRejectedValue(new Error('Directory does not exist'));
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it('should upload a valid JPEG file successfully', async () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
      const mockFile = createMockFile('test.jpg', jpegBuffer, 1024);

      const result = await service.uploadFile(mockFile, 'products');

      expect(result).toMatch(/^\/uploads\/products\/[a-f0-9-]+\.jpg$/);
      expect(mockFs.mkdir).toHaveBeenCalledWith('./uploads/products', { recursive: true });
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it('should upload a valid PNG file successfully', async () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const mockFile = createMockFile('test.png', pngBuffer, 1024, 'image/png');

      const result = await service.uploadFile(mockFile, 'avatars');

      expect(result).toMatch(/^\/uploads\/avatars\/[a-f0-9-]+\.png$/);
    });

    it('should upload a valid GIF file successfully', async () => {
      const gifBuffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
      const mockFile = createMockFile('test.gif', gifBuffer, 1024, 'image/gif');

      const result = await service.uploadFile(mockFile, 'images');

      expect(result).toMatch(/^\/uploads\/images\/[a-f0-9-]+\.gif$/);
    });

    it('should upload a valid WebP file successfully', async () => {
      const webpBuffer = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
      const mockFile = createMockFile('test.webp', webpBuffer, 1024, 'image/webp');

      const result = await service.uploadFile(mockFile, 'gallery');

      expect(result).toMatch(/^\/uploads\/gallery\/[a-f0-9-]+\.webp$/);
    });

    it('should throw error for missing file', async () => {
      await expect(service.uploadFile(null, 'products')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw error for empty file', async () => {
      const mockFile = createMockFile('test.jpg', Buffer.alloc(0), 0);

      await expect(service.uploadFile(mockFile, 'products')).rejects.toThrow(
        'File is empty or corrupted'
      );
    });

    it('should throw error for file too large', async () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
      const mockFile = createMockFile('large.jpg', largeBuffer, 6 * 1024 * 1024);

      await expect(service.uploadFile(mockFile, 'products')).rejects.toThrow(
        'File too large'
      );
    });

    it('should throw error for invalid file extension', async () => {
      const buffer = Buffer.from([0xFF, 0xD8, 0xFF]);
      const mockFile = createMockFile('test.exe', buffer, 1024);

      await expect(service.uploadFile(mockFile, 'products')).rejects.toThrow(
        'Invalid file type: .exe'
      );
    });

    it('should throw error for file without valid image signature', async () => {
      const invalidBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]); // Invalid signature
      const mockFile = createMockFile('test.jpg', invalidBuffer, 1024);

      await expect(service.uploadFile(mockFile, 'products')).rejects.toThrow(
        'File is not a valid image'
      );
    });

    it('should sanitize folder names', async () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const mockFile = createMockFile('test.jpg', jpegBuffer, 1024);

      await service.uploadFile(mockFile, 'user-uploads/../../../etc');

      expect(mockFs.mkdir).toHaveBeenCalledWith('./uploads/user-uploadsetc', { recursive: true });
    });

    it('should generate unique filenames', async () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const mockFile1 = createMockFile('same-name.jpg', jpegBuffer, 1024);
      const mockFile2 = createMockFile('same-name.jpg', jpegBuffer, 1024);

      const result1 = await service.uploadFile(mockFile1, 'products');
      const result2 = await service.uploadFile(mockFile2, 'products');

      expect(result1).not.toBe(result2);
      expect(result1).toMatch(/^\/uploads\/products\/[a-f0-9-]+\.jpg$/);
      expect(result2).toMatch(/^\/uploads\/products\/[a-f0-9-]+\.jpg$/);
    });

    it('should handle file system errors gracefully', async () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const mockFile = createMockFile('test.jpg', jpegBuffer, 1024);

      mockFs.writeFile.mockRejectedValue(new Error('Disk full'));

      await expect(service.uploadFile(mockFile, 'products')).rejects.toThrow(
        'Upload failed: Disk full'
      );
    });

    it('should create directory if it does not exist', async () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const mockFile = createMockFile('test.jpg', jpegBuffer, 1024);

      await service.uploadFile(mockFile, 'new-folder');

      expect(mockFs.mkdir).toHaveBeenCalledWith('./uploads/new-folder', { recursive: true });
    });

    it('should not create directory if it already exists', async () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      const mockFile = createMockFile('test.jpg', jpegBuffer, 1024);

      mockFs.access.mockResolvedValue(undefined); // Directory exists

      await service.uploadFile(mockFile, 'existing-folder');

      expect(mockFs.mkdir).not.toHaveBeenCalled();
    });
  });

  describe('Image signature validation', () => {
    it('should validate JPEG signatures correctly', () => {
      const validJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
      const invalidJpeg = Buffer.from([0xFF, 0xD7, 0xFF, 0xE0, 0x00, 0x10]);

      expect(() => {
        const mockFile = {
          originalname: 'test.jpg',
          buffer: validJpeg,
          size: validJpeg.length,
          mimetype: 'image/jpeg',
        } as Express.Multer.File;
        (service as any).validateFile(mockFile);
      }).not.toThrow();

      expect(() => {
        const mockFile = {
          originalname: 'test.jpg',
          buffer: invalidJpeg,
          size: invalidJpeg.length,
          mimetype: 'image/jpeg',
        } as Express.Multer.File;
        (service as any).validateFile(mockFile);
      }).toThrow('File is not a valid image');
    });

    it('should validate PNG signatures correctly', () => {
      const validPng = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
      const invalidPng = Buffer.from([0x89, 0x50, 0x4E, 0x46, 0x0D, 0x0A, 0x1A, 0x0A]);

      expect(() => {
        const mockFile = {
          originalname: 'test.png',
          buffer: validPng,
          size: validPng.length,
          mimetype: 'image/png',
        } as Express.Multer.File;
        (service as any).validateFile(mockFile);
      }).not.toThrow();

      expect(() => {
        const mockFile = {
          originalname: 'test.png',
          buffer: invalidPng,
          size: invalidPng.length,
          mimetype: 'image/png',
        } as Express.Multer.File;
        (service as any).validateFile(mockFile);
      }).toThrow('File is not a valid image');
    });
  });
});