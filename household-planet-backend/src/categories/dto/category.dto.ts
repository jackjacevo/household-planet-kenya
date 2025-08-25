import { IsString, IsOptional, IsBoolean, IsInt, MinLength, MaxLength, IsUrl, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BaseQueryDto } from '../../common/dto/base.dto';
import { IsValidSlug } from '../../common/validators/enhanced-validators';
import { IsSecureInput } from '../../common/validators/secure-input.validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2, { message: 'Category name must be at least 2 characters' })
  @MaxLength(100, { message: 'Category name cannot exceed 100 characters' })
  @IsSecureInput()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @MaxLength(100)
  @IsValidSlug()
  @Transform(({ value }) => value?.toLowerCase().trim())
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  @IsSecureInput()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Image must be a valid URL' })
  image?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  imageAlt?: string;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : null)
  @IsInt()
  @Min(1)
  parentId?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : 0)
  @IsInt()
  @Min(0)
  sortOrder?: number = 0;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Category name must be at least 2 characters' })
  @MaxLength(100, { message: 'Category name cannot exceed 100 characters' })
  @IsSecureInput()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsValidSlug()
  @Transform(({ value }) => value?.toLowerCase().trim())
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  @IsSecureInput()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Image must be a valid URL' })
  image?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  imageAlt?: string;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : null)
  @IsInt()
  @Min(1)
  parentId?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : 0)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CategoryQueryDto extends BaseQueryDto {
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : null)
  @IsInt()
  @Min(1)
  parentId?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;
}