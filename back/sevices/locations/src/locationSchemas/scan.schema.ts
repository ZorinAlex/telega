import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import ILocation from '../misc/interfaces/location.interface';
import { User } from './user.schema';

export type ScanDocument = Scan & Document;

@Schema({ timestamps: true })
export class Scan {
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Region' }])
  regionId;
  @Prop({type: Object})
  location: ILocation;
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  users: User[];
}

export const ScanSchema = SchemaFactory.createForClass(Scan);