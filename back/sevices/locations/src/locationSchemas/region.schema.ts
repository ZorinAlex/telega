import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ERegionScanStatus } from '../misc/enums/region.scan.status.enum';
export type RegionDocument = Region & Document;

@Schema({ timestamps: true , toJSON: { virtuals: true }})
export class Region {
  @Prop()
  minLat: number;
  @Prop()
  minLng: number;
  @Prop()
  maxLat: number;
  @Prop()
  maxLng: number;
  @Prop()
  radius: number;
  @Prop({default: ERegionScanStatus.SCHEDULED})
  status: ERegionScanStatus;
  @Prop()
  stepsByHeight: number;
  @Prop()
  stepsByWidth: number;
  @Prop()
  startOffsetX: number;
  @Prop()
  startOffsetY: number;
}

const RegionSchema = SchemaFactory.createForClass(Region);
RegionSchema.virtual('scans', {
  ref: 'Scan',
  localField: '_id',
  foreignField: 'regionId'
});
export {RegionSchema}
