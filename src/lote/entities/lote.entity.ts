import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose'; // Import Types here

export type LoteDocument = Lote & Document;

export enum LoteStatus {
  DISPONIBLE = 'disponible',
  RESERVADO = 'reservado',
  VENDIDO = 'vendido',
}

export enum Caracteristicas {
  VISTA_AL_MAR = 'vista_al_mar',
  CONTRA_FRENTE = 'contra_frente',
  LATERAL = 'lateral',
}

export enum Propietario {
  FANE = 'FANE',
  HENRY = 'HENRY',
  CAUTIO = 'CAUTIO',
}

export enum SalesProcessStatus {
  DISPONIBLE = 'Disponible',
  EN_NEGOCIACION = 'En negociación',
  RESERVADO = 'Reservado',
  VENDIDO = 'Vendido',
}

@Schema()
export class StatusChangeLog {
  @Prop({ required: true, enum: LoteStatus })
  status: LoteStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' }) // Assuming a User model exists
  changedBy: Types.ObjectId; // Changed type to Types.ObjectId

  @Prop({ default: Date.now })
  changedAt: Date;
}

const StatusChangeLogSchema = SchemaFactory.createForClass(StatusChangeLog);

@Schema()
export class Lote {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  price: number;

  @Prop()
  manzana: string; // New field

  @Prop()
  lote: string; // New field

  @Prop()
  m2: number;

  @Prop()
  metros_frente: number;

  @Prop({ type: [String], enum: Caracteristicas })
  caracteristicas: Caracteristicas[];

  @Prop({ required: true, enum: Propietario })
  propietario: Propietario;

  @Prop({ required: true, enum: SalesProcessStatus, default: SalesProcessStatus.DISPONIBLE })
  estadoProcesoVenta: SalesProcessStatus;

  @Prop({ default: false })
  featured: boolean;

  @Prop({ required: true, enum: LoteStatus, default: LoteStatus.DISPONIBLE })
  status: LoteStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  client: Types.ObjectId | null; // Reference to User ID, now optional and can be null

  @Prop({ type: Date })
  reservationDate: Date;

  @Prop({ default: Date.now })
  lastStatusModifiedAt: Date;

  @Prop({ type: [StatusChangeLogSchema], default: [] })
  statusChangeLog: StatusChangeLog[];
}

export const LoteSchema = SchemaFactory.createForClass(Lote);
