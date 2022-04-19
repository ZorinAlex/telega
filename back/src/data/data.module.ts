import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { TelegramModule } from '../telegram/telegram.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from '../schemas/session.schema';
import { Channel, ChannelSchema } from '../schemas/channel.schema';
import { Chat, ChatSchema } from '../schemas/chat.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { UserChatMessages, UserChatMessagesSchema } from '../schemas/user.chat.messages.schema';
import { Message, MessageSchema } from '../schemas/message.schema';
import { Photo, PhotoSchema } from '../schemas/photo.schema';

@Module({
  imports:[
    TelegramModule,
    MongooseModule.forFeature([
      { name: Channel.name, schema: ChannelSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: User.name, schema: UserSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Photo.name, schema: PhotoSchema },
      { name: UserChatMessages.name, schema: UserChatMessagesSchema }
    ]),
  ],
  providers: [DataService],
  exports: [DataService]
})
export class DataModule {}
