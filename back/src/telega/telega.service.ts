import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Channel, ChannelDocument } from '../schemas/channel.schema';
import { Chat, ChatDocument } from '../schemas/chat.schema';
import { Message, MessageDocument } from '../schemas/message.schema';
import { Photo, PhotoDocument } from '../schemas/photo.schema';
import { UserChatMessages, UserChatMessagesDocument } from '../schemas/user.chat.messages.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import AddChannelsDto from './dto/add.channels.dto';
import { DataService } from '../data/data.service';

@Injectable()
export class TelegaService {

  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Photo.name) private photoModel: Model<PhotoDocument>,
    @InjectModel(UserChatMessages.name) private userChatMessagesModel: Model<UserChatMessagesDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private dataService: DataService
  ){}

  async getChannels(){
    return await this.chatModel.find().exec()
  }

  async addToScan(addChannelsDto: AddChannelsDto){
    this.dataService.addChats(addChannelsDto.channels);
    return true
  }
}
