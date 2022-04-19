import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EditorDocument = Editor & Document;

@Schema()
export class Editor {
  @Prop()
  login: string;
  @Prop()
  password: string;
  @Prop()
  refresh: string;
}

export const EditorSchema = SchemaFactory.createForClass(Editor);