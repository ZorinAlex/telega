import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import ILocation from '../misc/interfaces/location.interface';
import { Scan } from './scan.schema';
import IDistance from '../misc/interfaces/distance.interface';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
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
  accessHash: string;
  @Prop()
  firstName: string;
  @Prop()
  lastName: string;
  @Prop()
  username: string;
  @Prop()
  phone: string;
  @Prop({type: Object})
  locationFind: ILocation;
  @Prop({type: Array})
  distance: IDistance[];
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Scan' }])
  scans: Scan[];
}

export const UserSchema = SchemaFactory.createForClass(User);