import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadManualDto } from './create-lead.dto';
import { IsOptional, IsString } from 'class-validator'; // Import necessary decorators

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export class UpdateLeadDto extends PartialType(CreateLeadManualDto) {
  @IsOptional()
  @IsString({ message: 'El ID del usuario asignado debe ser un texto.' })
  asignadoA?: string;

  @IsOptional()
  @IsString({ message: 'El ID del usuario debe ser un texto.' })
  user?: string;
}
