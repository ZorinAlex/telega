import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema()
export class Session {
  @Prop()
  session: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);