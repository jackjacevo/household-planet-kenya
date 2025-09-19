import { IsEmail, IsString, IsOptional, IsArray, IsBoolean, IsEnum } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'STAFF'])
  role?: 'ADMIN' | 'STAFF';

  @IsOptional()
  @IsArray()
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateStaffDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'STAFF'])
  role?: 'ADMIN' | 'STAFF';

  @IsOptional()
  @IsArray()
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
