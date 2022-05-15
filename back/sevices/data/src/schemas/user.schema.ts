import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Photo } from './photo.schema';
import { Chat } from './chat.schema';
import { UserChatMessages } from './user.chat.messages.schema';
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
  location: [number];
  @Prop({default: false})
  isPhotosScanned: boolean;
  @Prop({default: false})
  approvedVorog: boolean;
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }])
  photos: Photo[];
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }])
  chats: Chat[];
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'UserChatMessages' }])
  userChatMessages: UserChatMessages[];
}

export const UserSchema = SchemaFactory.createForClass(User);