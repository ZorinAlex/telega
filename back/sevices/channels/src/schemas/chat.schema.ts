import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type ChatDocument = Chat & Document;

@Schema({
  toJSON: { virtuals: true }
})
export class Chat {
  @Prop()
  channelId: string;
  @Prop()
  id: string;
  @Prop()
  accessHash: string;
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
  @Prop()
  messagesCount: number;
}

const ChatSchema = SchemaFactory.createForClass(Chat);
ChatSchema.virtual('userchatmessages', {
  ref: 'UserChatMessages',
  localField: '_id',
  foreignField: 'chatMongoId'
});
export {ChatSchema}