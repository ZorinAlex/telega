import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type ChatDocument = Chat & Document;

@Schema()
export class Chat {
  @Prop()
  channelId: string;
  @Prop()
  id: string;
  @Prop()
  verified: boolean;
  @Prop()
  hasLink: boolean;
  @Prop()
  hasGeo: boolean;
  @Prop()
  title: string;
  @Prop()
  username: string;
  @Prop()
  date: number;
  @Prop()
  usersCount: number;
  // users virtual
}

export const ChatSchema = SchemaFactory.createForClass(Chat);