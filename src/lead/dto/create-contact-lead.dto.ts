import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { LeadSource, LeadStatus } from '../entities/lead.entity';

export class CreateContactLeadDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre es requerido.' })
  nombre: string;

  @IsEmail({}, { message: 'El email debe ser un correo electrónico válido.' })
  @IsNotEmpty({ message: 'El email es requerido.' })
  email: string;

  @IsString({ message: 'El teléfono debe ser un texto.' })
  @IsOptional()
  telefono?: string;

  @IsString({ message: 'El tipo de consulta debe ser un texto.' })
  @IsNotEmpty({ message: 'El tipo de consulta es requerido.' })
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
