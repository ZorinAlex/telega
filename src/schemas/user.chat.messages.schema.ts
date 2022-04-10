import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
export type UserChatMessagesDocument = UserChatMessages & Document;

@Schema()
export class UserChatMessages {
  @Prop()
  messagesCount: number;

  //virtual messages
}

export const UserChatMessagesSchema = SchemaFactory.createForClass(UserChatMessages);