import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Definición del subdocumento para Documentos
@Schema({ _id: true, timestamps: { createdAt: 'uploadedAt' } })
export class UserDocumentFile {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string; // 'dni', 'income_proof', 'other'

  @Prop({ required: true })
  url: string;

  @Prop()
  uploadedAt: Date;
}

export const UserDocumentFileSchema =
  SchemaFactory.createForClass(UserDocumentFile);

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  @Prop({ default: false })
  profileComplete: boolean;

  // --- Nuevos Campos de Perfil ---
  @Prop()
  phone: string;

  @Prop()
  dni: string;

  @Prop()
  birthDate: Date;

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  province: string;

  @Prop()
  zipCode: string;

  @Prop()
  occupation: string;

  @Prop()
  monthlyIncome: string;

  @Prop()
  investmentExperience: string; // 'none', 'beginner', 'intermediate', 'advanced'

  @Prop()
  preferredContactMethod: string; // 'email', 'phone', 'whatsapp'

  @Prop()
  interestedLotSize: string; // 'small', 'medium', 'large', 'any'

  @Prop()
  budget: string;

  @Prop()
  timeline: string; // 'immediate', '3months', '6months', '1year', 'flexible'

  // --- Documentos Adjuntos ---
  @Prop({ type: [UserDocumentFileSchema], default: [] })
  documents: UserDocumentFile[];

  @Prop()
  createdAt: Date;

  @Prop()
  lastLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hook para calcular profileComplete antes de guardar
UserSchema.pre<UserDocument>('save', function (next) {
  const requiredFields = [
    this.phone,
    this.dni,
    this.birthDate,
    this.address,
    this.city,
    this.province,
    this.zipCode,
    this.occupation,
  ];

  this.profileComplete = requiredFields.every((field) => !!field);
  next();
});
