import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type UserChatMessagesDocument = UserChatMessages & Document;

@Schema({
  toJSON: { virtuals: true }
})
export class UserChatMessages {
  @Prop()
  messagesCount: number;
  @Prop({default: 0})
  savedMessagesCount: number;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chat'})
  chatMongoId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User'})
  userMongoId;
}
const UserChatMessagesSchema = SchemaFactory.createForClass(UserChatMessages);

  UserChatMessagesSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'UserChatMessagesMongoId'
  });

export {UserChatMessagesSchema}