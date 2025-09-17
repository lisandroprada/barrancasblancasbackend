import { IsString, IsOptional, IsEnum, IsDateString, IsUrl, IsPhoneNumber, IsEmail, IsMongoId } from 'class-validator';

export enum ActivityType {
  CALL = 'Llamada',
  EMAIL = 'Email',
  VISIT = 'Visita',
  MEETING = 'Reunión',
  WHATSAPP = 'WhatsApp/Mensaje',
  INTERNAL_TASK = 'Tarea Interna',
  DOCUMENT_SENT = 'Documentación Enviada',
  OTHER = 'Otro',
}

export class CreateActivityDto {
  @IsEnum(ActivityType)
  tipoActividad: ActivityType;

  @IsString()
  @IsOptional()
  comentarios?: string;

  @IsString()
  @IsOptional()
  proximoPaso?: string;

  // --- Specific fields based on ActivityType ---

  // For CALL
  @IsPhoneNumber('AR', { message: 'El número de contacto debe ser un número de teléfono válido de Argentina.' })
  @IsOptional()
  numeroContacto?: string; // To store the number called/contacted

  // For EMAIL
  @IsString()
  @IsOptional()
  asuntoEmail?: string; // Subject of the email
  
  @IsEmail({}, { message: 'El destinatario del email debe ser una dirección de correo electrónico válida.' })
  @IsOptional()
  destinatarioEmail?: string; // Recipient of the email

  // For VISIT, MEETING, CALL (if scheduled)
  @IsDateString({}, { message: 'La fecha programada debe ser una fecha y hora válidas.' })
  @IsOptional()
  fechaProgramada?: string; // Date and time for the event
  
  @IsString()
  @IsOptional()
  ubicacion?: string; // Location for visit/meeting

  // For DOCUMENT_SENT
  @IsString()
  @IsOptional()
  nombreDocumento?: string; // Name of the document sent
  
  @IsUrl({}, { message: 'La URL del documento debe ser una URL válida.' })
  @IsOptional()
  urlDocumento?: string; // URL to the document (if stored externally)

  // For INTERNAL_TASK
  @IsDateString({}, { message: 'La fecha de vencimiento de la tarea debe ser una fecha y hora válidas.' })
  @IsOptional()
  fechaVencimientoTarea?: string; // Due date for the internal task
  
  @IsMongoId({ message: 'El ID del responsable de la tarea debe ser un ID de Mongo válido.' })
  @IsOptional()
  responsableTareaId?: string; // User ID responsible for the task
}