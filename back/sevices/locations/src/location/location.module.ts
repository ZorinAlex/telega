import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { TelegramModule } from '../telegram/telegram.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../locationSchemas/user.schema';
import { Region, RegionSchema } from '../locationSchemas/region.schema';
import { Scan, ScanSchema } from '../locationSchemas/scan.schema';

@Module({
  imports: [
    TelegramModule,
    MongooseModule.forFeature([
      { name: Region.name, schema: RegionSchema },
      { name: Scan.name, schema: ScanSchema },
      { name: User.name, schema: UserSchema }
      ], 'locations'),
  ],
  providers: [LocationService],
  controllers: [LocationController]
})
export class LocationModule {}
