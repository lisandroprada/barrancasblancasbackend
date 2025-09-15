import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Caracteristicas, LoteStatus, Propietario } from '../entities/lote.entity'; // Import LoteStatus

export class CreateLoteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsOptional()
  manzana?: string; // New field

  @IsString()
  @IsOptional()
  lote?: string; // New field

  @IsNumber()
  @IsOptional()
  m2?: number;

  @IsNumber()
  @IsOptional()
  metros_frente?: number;

  @IsArray()
  @IsEnum(Caracteristicas, { each: true })
  @IsOptional()
  caracteristicas?: Caracteristicas[];

  @IsEnum(Propietario)
  @IsNotEmpty()
  propietario: Propietario;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsEnum(LoteStatus)
  @IsOptional()
  status?: LoteStatus;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsDateString()
  @IsOptional()
  reservationDate?: Date;
}
