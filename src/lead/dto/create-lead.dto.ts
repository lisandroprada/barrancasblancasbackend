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
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre es requerido.' })
  nombre: string;

  @IsEmail({}, { message: 'El email debe ser un correo electrónico válido.' })
  @IsNotEmpty({ message: 'El email es requerido.' })
  email: string;

  @IsString({ message: 'El teléfono debe ser un texto.' })
  @IsOptional()
  telefono?: string;

  @IsEnum(LeadSource, { message: 'La fuente del lead no es válida.' })
  @IsOptional()
  fuente?: LeadSource;

  @IsEnum(LeadStatus, { message: 'El estado del lead no es válido.' })
  @IsOptional()
  estado?: LeadStatus;

  @IsString({ message: 'El ID del usuario asignado debe ser un texto.' })
  @IsOptional()
  asignadoA?: string; // User ID as string

  @IsString({ message: 'El ID del usuario debe ser un texto.' })
  @IsOptional()
  user?: string; // User ID as string
}

class LoteIdentificador {
  @IsNumber({}, { message: 'La manzana debe ser un número.' })
  manzana: number;

  @IsNumber({}, { message: 'El lote debe ser un número.' })
  lote: number;
}

export class CreateLeadContactDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre es requerido.' })
  nombre: string;

  @IsEmail({}, { message: 'El email debe ser un correo electrónico válido.' })
  @IsNotEmpty({ message: 'El email es requerido.' })
  email: string;

  @IsPhoneNumber('AR', { message: 'El teléfono debe ser un número de teléfono válido de Argentina.' }) // Asumiendo números de teléfono de Argentina
  @IsOptional()
  telefono?: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @IsEnum(LeadRequestType, { message: 'El tipo de solicitud no es válido.' })
  tipoSolicitud: LeadRequestType;

  @IsOptional()
  @IsString({ message: 'El mensaje debe ser un texto.' })
  mensaje?: string;

  @IsOptional()
  @IsArray({ message: 'Los lotes de interés deben ser un arreglo.' })
  @ValidateNested({ each: true })
  @Type(() => LoteIdentificador)
  lotesInteres?: LoteIdentificador[];

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de visita preferida debe ser una fecha válida.' })
  fechaVisitaPreferida?: Date;
}
