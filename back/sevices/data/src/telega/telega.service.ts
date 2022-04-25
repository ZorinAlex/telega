import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Channel, ChannelDocument } from '../schemas/channel.schema';
import { Chat, ChatDocument } from '../schemas/chat.schema';
import { Message, MessageDocument } from '../schemas/message.schema';
import { Photo, PhotoDocument } from '../schemas/photo.schema';
import { UserChatMessages, UserChatMessagesDocument } from '../schemas/user.chat.messages.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import FindChannelsDto from './dto/find.channels.dto';
import FindUserDto from './dto/find.user.dto';
import * as _ from 'lodash';

@Injectable()
export class TelegaService {

  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Photo.name) private photoModel: Model<PhotoDocument>,
    @InjectModel(UserChatMessages.name) private userChatMessagesModel: Model<UserChatMessagesDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ){}

  async getChannels(){
    return await this.channelModel.find().populate('chats').exec();
  }

  async findChannel(findChannelsDto: FindChannelsDto){
    return await this.channelModel.findById(findChannelsDto.id)
      .populate({
        path: 'chats',
        populate: {
            path: 'userchatmessages',
            options: {
              sort: {messagesCount: -1},
              limit: 100
            },
            populate:{
              path: 'userMongoId',
              model: 'User'
            }
        }
      })
      .exec();
  }

  async findUser(findUserDto: FindUserDto){
    if(_.has(findUserDto, 'id')){
      const req = this.userModel.findById(findUserDto.id);
      if(findUserDto.fullData){
        return await req
          .populate({
            path: 'userChatMessages',
            populate:[{
              path: 'chatMongoId',
            },
            {
              path: 'messages'
            }],
          }).exec()
      }else{
        return await req.exec()
      }
    }
  }
}
