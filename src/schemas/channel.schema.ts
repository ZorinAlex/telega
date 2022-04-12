import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Chat } from './chat.schema';
export type ChannelDocument = Channel & Document;

@Schema()
export class Channel {
  @Prop()
  name: string;
  @Prop()
  blocked: boolean;
  @Prop()
  id: string;
  @Prop()
  participantsCount: number;
  @Prop()
  adminsCount: number;
  @Prop()
  kickedCount: number;
  @Prop()
  bannedCount: number;
  @Prop()
  onlineCount: number;
  @Prop()
  migratedFromChatId: string;
  @Prop()
  linkedChatId: string;
  @Prop()
  location: string;
  @Prop()
  about: string;
  @Prop()
  scanDate: Date;
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }])
  chats: Chat[];
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);