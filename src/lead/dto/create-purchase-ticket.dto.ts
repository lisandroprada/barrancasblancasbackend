import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { PurchaseTicketStatus } from '../entities/purchase-ticket.entity';

export class CreatePurchaseTicketDto {
  @IsString()
  @IsNotEmpty()
  leadId: string; // The ID of the lead this purchase ticket belongs to

  @IsString()
  @IsNotEmpty()
  loteId: string; // The ID of the lote this purchase ticket is for

  @IsNumber()
  @IsNotEmpty()
  montoFinal: number;

  @IsString()
  @IsNotEmpty()
  condicionesFinales: string;

  @IsEnum(PurchaseTicketStatus)
  @IsOptional()
  estado?: PurchaseTicketStatus;

  // generadoPor and documentUrl will be set by the service
}
