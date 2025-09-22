import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  IsArray,
  IsNumber,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  LeadSource,
  LeadStatus,
  LeadRequestType,
} from '../entities/lead.entity';

export class CreateLeadManualDto {
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

class LoteIdentificador {
  @IsNumber()
  manzana: number;

  @IsNumber()
  lote: number;
}

export class CreateLeadContactDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber('AR') // Asumiendo números de teléfono de Argentina
  @IsOptional()
  telefono?: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @IsEnum(LeadRequestType)
  tipoSolicitud: LeadRequestType;

  @IsOptional()
  @IsString()
  mensaje?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LoteIdentificador)
  lotesInteres?: LoteIdentificador[];

  @IsOptional()
  @IsDateString()
  fechaVisitaPreferida?: Date;
}
