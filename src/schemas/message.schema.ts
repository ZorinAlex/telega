import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
export type MessageDocument = Message & Document;

@Schema()
export class Message {
  @Prop({ type: mongoose.Schema.Types.ObjectId})
  UserChatMessagesMongoId;
  @Prop()
  message: string;
  @Prop()
  id: string
  @Prop()
  fromId: string
  @Prop()
  date: number
}

export const MessageSchema = SchemaFactory.createForClass(Message);