import { IsOptional, IsString } from 'class-validator';

export class BulkImportDto {
  @IsOptional()
  @IsString()
  userId?: string;
}