import { Injectable } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  private readonly uploadPath = './uploads';

  async uploadMultiple(files: Express.Multer.File[], folder: string): Promise<string[]> {
    const uploadDir = join(this.uploadPath, folder);
    await mkdir(uploadDir, { recursive: true });

    const uploadPromises = files.map(async (file) => {
      const filename = `${randomUUID()}-${file.originalname}`;
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, file.buffer);
      return `/uploads/${folder}/${filename}`;
    });

    return Promise.all(uploadPromises);
  }

  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    const uploadDir = join(this.uploadPath, folder);
    await mkdir(uploadDir, { recursive: true });

    const filename = `${randomUUID()}-${file.originalname}`;
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, file.buffer);
    
    return `/uploads/${folder}/${filename}`;
  }
}