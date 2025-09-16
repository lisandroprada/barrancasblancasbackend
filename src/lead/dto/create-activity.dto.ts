import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ActivityType } from '../entities/activity.entity';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  leadId: string; // The ID of the lead this activity belongs to

  @IsEnum(ActivityType)
  @IsNotEmpty()
  tipoActividad: ActivityType;

  @IsString()
  @IsOptional()
  comentarios?: string;

  @IsString()
  @IsOptional()
  proximoPaso?: string;

  // creadoPor will be set by the service based on the authenticated user
}
