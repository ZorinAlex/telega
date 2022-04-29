import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from '../schemas/session.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema }
    ], 'telega'),
    ConfigModule
  ],
  providers: [TelegramService],
  exports: [TelegramService]
})
export class TelegramModule {}
