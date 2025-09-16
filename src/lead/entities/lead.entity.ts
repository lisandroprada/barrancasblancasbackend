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
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
