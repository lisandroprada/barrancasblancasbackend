import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsOptional, IsDate, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class DocumentDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  url: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  dni?: string;

  @IsDate()
  @IsOptional()
  birthDate?: Date;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsOptional()
  occupation?: string;

  @IsString()
  @IsOptional()
  monthlyIncome?: string;

  @IsString()
  @IsOptional()
  investmentExperience?: string;

  @IsString()
  @IsOptional()
  preferredContactMethod?: string;

  @IsString()
  @IsOptional()
  interestedLotSize?: string;

  @IsString()
  @IsOptional()
  budget?: string;

  @IsString()
  @IsOptional()
  timeline?: string;

  @IsBoolean()
  @IsOptional()
  profileComplete?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents?: DocumentDto[];
}