import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Lead } from './lead.entity';
import { Lote } from '../../lote/entities/lote.entity';
import { User } from '../../user/entities/user.entity';

export type ProposalDocument = Proposal & Document;

export enum ProposalStatus {
  GENERADA = 'Generada',
  ENVIADA = 'Enviada',
  ACEPTADA = 'Aceptada',
  RECHAZADA = 'Rechazada',
  EXPIRADA = 'Expirada',
}

@Schema()
export class Proposal {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lead', required: true })
  lead: Types.ObjectId | Lead;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lote', required: true })
  lote: Types.ObjectId | Lote;

  @Prop({ required: true })
  montoTotal: number;

  @Prop({ required: true })
  condicionesPago: string; // e.g., "30% down, 12 installments"

  @Prop({ required: true, enum: ProposalStatus, default: ProposalStatus.GENERADA })
  estado: ProposalStatus;

  @Prop({ default: Date.now })
  fechaGeneracion: Date;

  @Prop({ type: Date })
  fechaExpiracion?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  generadaPor: Types.ObjectId | User; // User who generated the proposal

  @Prop()
  documentUrl?: string; // URL to the generated PDF document
}

export const ProposalSchema = SchemaFactory.createForClass(Proposal);
