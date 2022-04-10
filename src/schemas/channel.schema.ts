import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type ChannelDocument = Channel & Document;

@Schema()
export class Channel {
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
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);