import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Lead } from './lead.entity'; // Import Lead entity
import { User } from '../../user/entities/user.entity'; // Import User entity

export type ActivityDocument = Activity & Document;

export enum ActivityType {
  LLAMADA = 'Llamada',
  EMAIL = 'Email',
  VISITA = 'Visita',
  REUNION = 'Reunión',
  // Add other activity types as needed
}

@Schema()
export class Activity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lead', required: true })
  lead: Types.ObjectId | Lead; // Reference to the Lead

  @Prop({ required: true, enum: ActivityType })
  tipoActividad: ActivityType;

  @Prop({ default: Date.now })
  fecha: Date;

  @Prop()
  comentarios: string;

  @Prop({ required: false })
  proximoPaso?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creadoPor: Types.ObjectId | User; // User who created the activity
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
