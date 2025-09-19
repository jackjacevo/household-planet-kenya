import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { IsKenyanPhone } from '../../common/validators/enhanced-validators';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsKenyanPhone()
  phone?: string;
}
