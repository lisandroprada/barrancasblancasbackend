import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { LeadSource, LeadStatus } from '../entities/lead.entity';

export class CreateContactLeadDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsNotEmpty()
  tipoConsulta: string; // New field for the contact form

  // These fields will be set by the service, not directly from the contact form
  // @IsEnum(LeadSource)
  // @IsOptional()
  // fuente?: LeadSource;

  // @IsEnum(LeadStatus)
  // @IsOptional()
  // estado?: LeadStatus;

  // @IsString()
  // @IsOptional()
  // asignadoA?: string; // User ID as string

  // @IsString()
  // @IsOptional()
  // user?: string; // User ID as string
}
