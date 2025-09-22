import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadManualDto } from './create-lead.dto';
import { IsOptional, IsString } from 'class-validator'; // Import necessary decorators

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export class UpdateLeadDto extends PartialType(CreateLeadManualDto) {
  @IsOptional()
  @IsString()
  asignadoA?: string;

  @IsOptional()
  @IsString()
  user?: string;
}
