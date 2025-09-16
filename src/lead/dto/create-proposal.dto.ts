import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ProposalStatus } from '../entities/proposal.entity';

export class CreateProposalDto {
  @IsString()
  @IsNotEmpty()
  leadId: string; // The ID of the lead this proposal belongs to

  @IsString()
  @IsNotEmpty()
  loteId: string; // The ID of the lote this proposal is for

  @IsNumber()
  @IsNotEmpty()
  montoTotal: number;

  @IsString()
  @IsNotEmpty()
  condicionesPago: string;

  @IsEnum(ProposalStatus)
  @IsOptional()
  estado?: ProposalStatus;

  @IsString()
  @IsOptional()
  fechaExpiracion?: string; // ISO date string

  // generadaPor and documentUrl will be set by the service
}
