import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { PurchaseTicketStatus } from '../entities/purchase-ticket.entity';

export class CreatePurchaseTicketDto {
  @IsString({ message: 'El ID del lead debe ser un texto.' })
  @IsNotEmpty({ message: 'El ID del lead es requerido.' })
  leadId: string; // The ID of the lead this purchase ticket belongs to

  @IsString({ message: 'El ID del lote debe ser un texto.' })
  @IsNotEmpty({ message: 'El ID del lote es requerido.' })
  loteId: string; // The ID of the lote this purchase ticket is for

  @IsNumber({}, { message: 'El monto final debe ser un número.' })
  @IsNotEmpty({ message: 'El monto final es requerido.' })
  montoFinal: number;

  @IsString({ message: 'Las condiciones finales deben ser un texto.' })
  @IsNotEmpty({ message: 'Las condiciones finales son requeridas.' })
  condicionesFinales: string;

  @IsEnum(PurchaseTicketStatus, { message: 'El estado del boleto de compra no es válido.' })
  @IsOptional()
  estado?: PurchaseTicketStatus;

  // generadoPor and documentUrl will be set by the service
}
