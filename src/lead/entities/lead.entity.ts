import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '../../user/entities/user.entity'; // Assuming User entity path

export type LeadDocument = Lead & Document;

export enum LeadSource {
  FRONTEND = 'frontend',
  MANUAL = 'manual',
  // Add other sources as needed
}

export enum LeadStatus {
  NUEVO = 'Nuevo',
  EN_CONTACTO = 'En contacto',
  CALIFICADO = 'Calificado',
  DESCARTADO = 'Descartado',
  // Add other statuses as needed
}

export enum LeadRequestType {
  INFORMACION_GENERAL = 'informacion_general',
  COTIZACION_SIMPLE = 'cotizacion_simple',
  COTIZACION_MULTIPLE = 'cotizacion_multiple',
  COORDINAR_VISITA = 'coordinar_visita',
  FINANCIACION = 'financiacion',
}

@Schema()
export class LoteIdentificadorSchema {
  @Prop({ required: true })
  manzana: number;

  @Prop({ required: true })
  lote: number;
}

const LoteIdentificadorSchemaFactory = SchemaFactory.createForClass(LoteIdentificadorSchema);

@Schema()
export class Lead {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  telefono: string;

  @Prop({ required: true, enum: LeadSource, default: LeadSource.FRONTEND })
  fuente: LeadSource;

  @Prop({ required: true, enum: LeadStatus, default: LeadStatus.NUEVO })
  estado: LeadStatus;

  @Prop({ default: Date.now })
  fechaCreacion: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  asignadoA?: Types.ObjectId; // Reference to User (salesperson) with 'vendedor' role

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  user?: Types.ObjectId; // Reference to User if the lead registers

  @Prop({ enum: LeadRequestType, required: false })
  tipoSolicitud?: LeadRequestType;

  @Prop({ required: false })
  mensaje?: string;

  @Prop({ type: [LoteIdentificadorSchemaFactory], required: false })
  lotesInteres?: { manzana: number; lote: number }[];

  @Prop({ required: false })
  fechaVisitaPreferida?: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
