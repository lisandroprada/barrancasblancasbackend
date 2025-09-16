import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Lead } from './lead.entity';
import { Lote } from '../../lote/entities/lote.entity';
import { User } from '../../user/entities/user.entity';

export type PurchaseTicketDocument = PurchaseTicket & Document;

export enum PurchaseTicketStatus {
  GENERADO = 'Generado',
  FIRMADO = 'Firmado',
  CANCELADO = 'Cancelado',
}

@Schema()
export class PurchaseTicket {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lead', required: true })
  lead: Types.ObjectId | Lead;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lote', required: true })
  lote: Types.ObjectId | Lote;

  @Prop({ required: true })
  montoFinal: number;

  @Prop({ required: true })
  condicionesFinales: string; // e.g., "Final payment terms"

  @Prop({ required: true, enum: PurchaseTicketStatus, default: PurchaseTicketStatus.GENERADO })
  estado: PurchaseTicketStatus;

  @Prop({ default: Date.now })
  fechaGeneracion: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  generadoPor: Types.ObjectId | User; // User who generated the purchase ticket

  @Prop()
  documentUrl?: string; // URL to the generated PDF document
}

export const PurchaseTicketSchema = SchemaFactory.createForClass(PurchaseTicket);
