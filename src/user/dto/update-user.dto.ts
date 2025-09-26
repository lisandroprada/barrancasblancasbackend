import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class DocumentDto {
  @IsString({ message: 'El nombre del documento debe ser un texto.' })
  name: string;

  @IsString({ message: 'El tipo de documento debe ser un texto.' })
  type: string;

  @IsString({ message: 'La URL del documento debe ser un texto.' })
  url: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString({ message: 'El teléfono debe ser un texto.' })
  @IsOptional()
  phone?: string;

  @IsString({ message: 'El DNI debe ser un texto.' })
  @IsOptional()
  dni?: string;

  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida.' })
  @IsOptional()
  birthDate?: string;

  @IsString({ message: 'La dirección debe ser un texto.' })
  @IsOptional()
  address?: string;

  @IsString({ message: 'La ciudad debe ser un texto.' })
  @IsOptional()
  city?: string;

  @IsString({ message: 'La provincia debe ser un texto.' })
  @IsOptional()
  province?: string;

  @IsString({ message: 'El código postal debe ser un texto.' })
  @IsOptional()
  zipCode?: string;

  @IsString({ message: 'La ocupación debe ser un texto.' })
  @IsOptional()
  occupation?: string;

  @IsString({ message: 'Los ingresos mensuales deben ser un texto.' })
  @IsOptional()
  monthlyIncome?: string;

  @IsString({ message: 'La experiencia de inversión debe ser un texto.' })
  @IsOptional()
  investmentExperience?: string;

  @IsString({ message: 'El método de contacto preferido debe ser un texto.' })
  @IsOptional()
  preferredContactMethod?: string;

  @IsString({ message: 'El tamaño de lote interesado debe ser un texto.' })
  @IsOptional()
  interestedLotSize?: string;

  @IsString({ message: 'El presupuesto debe ser un texto.' })
  @IsOptional()
  budget?: string;

  @IsString({ message: 'La línea de tiempo debe ser un texto.' })
  @IsOptional()
  timeline?: string;

  @IsBoolean({ message: 'El perfil completo debe ser un booleano.' })
  @IsOptional()
  profileComplete?: boolean;

  @IsArray({ message: 'Los documentos deben ser un arreglo.' })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents?: DocumentDto[];
}