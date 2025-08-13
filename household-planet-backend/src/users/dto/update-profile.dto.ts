import { IsString, IsOptional, IsPhoneNumber, IsEnum, IsDateString, IsBoolean, IsUrl } from 'class-validator';
import { AddressType } from '../../common/enums';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsPhoneNumber('KE')
  phone?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;
}

export class AddAddressDto {
  @IsEnum(AddressType)
  type: AddressType;

  @IsString()
  fullName: string;

  @IsPhoneNumber('KE')
  phone: string;

  @IsString()
  county: string;

  @IsString()
  town: string;

  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}