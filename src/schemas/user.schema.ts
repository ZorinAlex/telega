import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  bot: boolean;
  @Prop()
  verified: boolean;
  @Prop()
  fake: boolean;
  @Prop()
  id: string;
  @Prop()
  firstName: string;
  @Prop()
  lastName: string;
  @Prop()
  username: string;
  @Prop()
  phone: string;
  @Prop()
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);