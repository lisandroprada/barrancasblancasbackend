import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { LeadSource, LeadStatus } from '../entities/lead.entity';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsEnum(LeadSource)
  @IsOptional()
  fuente?: LeadSource;

  @IsEnum(LeadStatus)
  @IsOptional()
  estado?: LeadStatus;

  @IsString()
  @IsOptional()
  asignadoA?: string; // User ID as string

  @IsString()
  @IsOptional()
  user?: string; // User ID as string
}
