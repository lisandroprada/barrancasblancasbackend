import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Lead, LeadRequestType } from './lead.entity';

export type LeadSubmissionDocument = LeadSubmission & Document;

@Schema()
export class LoteIdentificadorSubmission {
  @Prop({ required: true })
  manzana: number;

  @Prop({ required: true })
  lote: number;
}

const LoteIdentificadorSubmissionSchema = SchemaFactory.createForClass(LoteIdentificadorSubmission);

@Schema({ timestamps: true }) // Add timestamps for creation date
export class LeadSubmission {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lead', required: true })
  lead: Types.ObjectId | Lead;

  @Prop({ enum: LeadRequestType, required: true })
  tipoSolicitud: LeadRequestType;

  @Prop({ required: false })
  mensaje?: string;

  @Prop({ type: [LoteIdentificadorSubmissionSchema], required: false })
  lotesInteres?: { manzana: number; lote: number }[];

  @Prop({ required: false })
  fechaVisitaPreferida?: Date;

  @Prop({ default: Date.now })
  fechaEnvio: Date;
}

export const LeadSubmissionSchema = SchemaFactory.createForClass(LeadSubmission);
