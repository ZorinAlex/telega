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
    }else{
      const findObject = {};
      _.forIn(findUserDto, (value, key)=>{
        switch (key) {
          case 'firstName':
            if(!_.isNil(findUserDto.firstName)){
              const reg = new RegExp(findUserDto.firstName);
              findObject['firstName'] = {
                $regex: reg, $options: 'i'
              }
            }
            break;
          case 'lastName':
            if(!_.isNil(findUserDto.lastName)){
              const reg = new RegExp(findUserDto.lastName);
              findObject['lastName'] = {
                $regex: reg, $options: 'i'
              }
            }
            break;
          case 'username':
            if(!_.isNil(findUserDto.username)){
              const reg = new RegExp(findUserDto.username);
              findObject['username'] = {
                $regex: reg, $options: 'i'
              }
            }
            break;
          case 'phone':
            if(!_.isNil(findUserDto.phone)){
              const reg = new RegExp(findUserDto.phone);
              findObject['phone'] = {
                $regex: reg, $options: 'i'
              }
            }
            break;
          case 'withPhoneOnly':
            if(!_.isNil(findUserDto.withPhoneOnly)){
              findObject['phone'] = {
                $ne: null
              }
            }
            break;
        }
      });
      const skip: number = _.isNil(findUserDto.skip)?0:findUserDto.skip;
      const limit: number = _.isNil(findUserDto.limit)?25:findUserDto.limit;
      const count = await this.userModel.count(findObject).exec();
      const result = await this.userModel.find(findObject)
        .skip(skip)
        .limit(limit)
        .exec();
      return {
        count,
        result
      }
    }
  }
}
