import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
export type UserChatMessagesDocument = UserChatMessages & Document;

@Schema()
export class UserChatMessages {
  @Prop()
  messagesCount: number;
  @Prop({default: 0})
  savedMessagesCount: number;
  @Prop({ type: mongoose.Schema.Types.ObjectId})
  chatMongoId;
  //virtual messages
}

export const UserChatMessagesSchema = SchemaFactory.createForClass(UserChatMessages);