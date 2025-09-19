import { IsInt, IsString, IsOptional, Min, Max, IsBoolean, MaxLength, MinLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BaseQueryDto } from '../../common/dto/base.dto';
import { IsSecureInput } from '../../common/validators/secure-input.validator';

export class CreateReviewDto {
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Product ID must be a valid integer' })
  @Min(1, { message: 'Product ID must be greater than 0' })
  productId: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Rating must be a valid integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating: number;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
  @IsSecureInput()
  @Transform(({ value }) => value?.trim())
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Comment must be at least 10 characters' })
  @MaxLength(1000, { message: 'Comment cannot exceed 1000 characters' })
  @IsSecureInput()
  @Transform(({ value }) => value?.trim())
  comment?: string;
}

export class UpdateReviewDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Rating must be a valid integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating?: number;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
  @IsSecureInput()
  @Transform(({ value }) => value?.trim())
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Comment must be at least 10 characters' })
  @MaxLength(1000, { message: 'Comment cannot exceed 1000 characters' })
  @IsSecureInput()
  @Transform(({ value }) => value?.trim())
  comment?: string;
}

export class ReviewQueryDto extends BaseQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  productId?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;
}
