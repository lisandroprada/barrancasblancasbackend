import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ProposalStatus } from '../entities/proposal.entity';

export class CreateProposalDto {
  @IsString({ message: 'El ID del lead debe ser un texto.' })
  @IsNotEmpty({ message: 'El ID del lead es requerido.' })
  leadId: string; // The ID of the lead this proposal belongs to

  @IsString({ message: 'El ID del lote debe ser un texto.' })
  @IsNotEmpty({ message: 'El ID del lote es requerido.' })
  loteId: string; // The ID of the lote this proposal is for

  @IsNumber({}, { message: 'El monto total debe ser un número.' })
  @IsNotEmpty({ message: 'El monto total es requerido.' })
  montoTotal: number;

  @IsString({ message: 'Las condiciones de pago deben ser un texto.' })
  @IsNotEmpty({ message: 'Las condiciones de pago son requeridas.' })
  condicionesPago: string;

  @IsEnum(ProposalStatus, { message: 'El estado de la propuesta no es válido.' })
  @IsOptional()
  estado?: ProposalStatus;

  @IsString({ message: 'La fecha de expiración debe ser un texto.' })
  @IsOptional()
  fechaExpiracion?: string; // ISO date string

  // generadaPor and documentUrl will be set by the service
}
