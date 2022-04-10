import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from '../schemas/session.schema';
import { ConfigModule } from '@nestjs/config';
import { Channel, ChannelSchema } from '../schemas/channel.schema';
import { Chat, ChatSchema } from '../schemas/chat.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: User.name, schema: UserSchema }
      ]),
    ConfigModule
  ],
  providers: [TelegramService]
})
export class TelegramModule {}
