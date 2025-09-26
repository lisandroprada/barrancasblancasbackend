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
import {
  Caracteristicas,
  LoteStatus,
  Propietario,
  SalesProcessStatus,
} from '../entities/lote.entity'; // Import LoteStatus and SalesProcessStatus

export class CreateLoteDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre es requerido.' })
  name: string;

  @IsString({ message: 'La descripción debe ser un texto.' })
  description: string;

  @IsNumber({}, { message: 'El precio debe ser un número.' })
  @IsNotEmpty({ message: 'El precio es requerido.' })
  price: number;

  @IsString({ message: 'La manzana debe ser un texto.' })
  @IsOptional()
  manzana?: string; // New field

  @IsString({ message: 'El lote debe ser un texto.' })
  @IsOptional()
  lote?: string; // New field

  @IsNumber({}, { message: 'Los m2 deben ser un número.' })
  @IsOptional()
  m2?: number;

  @IsNumber({}, { message: 'Los metros de frente deben ser un número.' })
  @IsOptional()
  metros_frente?: number;

  @IsArray({ message: 'Las características deben ser un arreglo.' })
  @IsEnum(Caracteristicas, {
    each: true,
    message: 'Característica no válida.',
  })
  @IsOptional()
  caracteristicas?: Caracteristicas[];

  @IsEnum(Propietario, { message: 'Propietario no válido.' })
  @IsNotEmpty({ message: 'El propietario es requerido.' })
  propietario: Propietario;

  @IsEnum(SalesProcessStatus, {
    message: 'Estado de proceso de venta no válido.',
  })
  @IsOptional()
  estadoProcesoVenta?: SalesProcessStatus;

  @IsBoolean({ message: 'Destacado debe ser un booleano.' })
  @IsOptional()
  featured?: boolean;

  @IsEnum(LoteStatus, { message: 'Estado no válido.' })
  @IsOptional()
  status?: LoteStatus;

  @IsString({ message: 'El ID de cliente debe ser un texto.' })
  @IsOptional()
  clientId?: string;

  @IsDateString(
    {},
    { message: 'La fecha de reserva debe ser una fecha válida.' },
  )
  @IsOptional()
  reservationDate?: Date;
}
