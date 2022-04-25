import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
export type PhotoDocument = Photo & Document;

@Schema()
export class Photo {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  userMongoId;
  @Prop()
  id: string;
  @Prop()
  accessHash: string;
  @Prop()
  fileReference: mongoose.Schema.Types.Buffer;
  @Prop()
  path: string;
  @Prop({default: false})
  isReal: boolean;
}

export const PhotoSchema = SchemaFactory.createForClass(Photo);