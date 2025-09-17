import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Lead } from './lead.entity'; // Import Lead entity
import { User } from '../../user/entities/user.entity'; // Import User entity
import { ActivityType } from '../dto/create-activity.dto'; // Import ActivityType enum from DTO

export type ActivityDocument = Activity & Document;

@Schema({ timestamps: true }) // Added timestamps
export class Activity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lead', required: true })
  lead: Types.ObjectId | Lead; // Reference to the Lead

  @Prop({ required: true, enum: ActivityType })
  tipoActividad: ActivityType;

  @Prop({ default: Date.now })
  fecha: Date;

  @Prop()
  comentarios?: string; // Made optional

  @Prop({ required: false })
  proximoPaso?: string;

  // --- Specific fields based on ActivityType ---
  @Prop()
  numeroContacto?: string;

  @Prop()
  asuntoEmail?: string;

  @Prop()
  destinatarioEmail?: string;

  @Prop()
  fechaProgramada?: Date; // Stored as Date object

  @Prop()
  ubicacion?: string;

  @Prop()
  nombreDocumento?: string;

  @Prop()
  urlDocumento?: string;

  @Prop()
  fechaVencimientoTarea?: Date; // Stored as Date object

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  responsableTareaId?: Types.ObjectId | User; // Reference to User

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  registradoPor: Types.ObjectId | User; // User who registered the activity (renamed from creadoPor)
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);