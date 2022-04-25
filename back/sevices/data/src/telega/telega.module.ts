import { Module } from '@nestjs/common';
import { TelegaService } from './telega.service';
import { TelegaController } from './telega.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Channel, ChannelSchema } from '../schemas/channel.schema';
import { Chat, ChatSchema } from '../schemas/chat.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Message, MessageSchema } from '../schemas/message.schema';
import { Photo, PhotoSchema } from '../schemas/photo.schema';
import { UserChatMessages, UserChatMessagesSchema } from '../schemas/user.chat.messages.schema';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: Channel.name, schema: ChannelSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: User.name, schema: UserSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Photo.name, schema: PhotoSchema },
      { name: UserChatMessages.name, schema: UserChatMessagesSchema }
    ])
  ],
  providers: [TelegaService],
  controllers: [TelegaController]
})
export class TelegaModule {}
