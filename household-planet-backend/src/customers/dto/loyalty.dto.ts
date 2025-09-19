import { IsString, IsOptional, IsBoolean, IsNumber, IsObject, IsDateString } from 'class-validator';

export class CreateLoyaltyProgramDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNumber()
  pointsPerKsh: number;

  @IsOptional()
  @IsNumber()
  minimumSpend?: number;

  @IsOptional()
  @IsObject()
  rules?: any;
}

export class CreateLoyaltyRewardDto {
  @IsNumber()
  programId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  pointsCost: number;

  @IsString()
  rewardType: string;

  @IsOptional()
  @IsNumber()
  rewardValue?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  validUntil?: string;
}
