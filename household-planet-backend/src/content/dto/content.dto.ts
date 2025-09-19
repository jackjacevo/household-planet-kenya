import { IsString, IsOptional, IsBoolean, IsInt, IsDateString } from 'class-validator';

export class CreateContentPageDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateContentPageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class CreateBannerDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  buttonText?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateBannerDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  buttonText?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CreateEmailTemplateDto {
  @IsString()
  name: string;

  @IsString()
  subject: string;

  @IsString()
  htmlContent: string;

  @IsOptional()
  @IsString()
  textContent?: string;

  @IsOptional()
  variables?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateEmailTemplateDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  htmlContent?: string;

  @IsOptional()
  @IsString()
  textContent?: string;

  @IsOptional()
  variables?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateFAQDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateFAQDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class CreateBlogPostDto {
  @IsString()
  slug: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsString()
  author: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
