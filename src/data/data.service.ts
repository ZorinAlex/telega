import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Channel, ChannelDocument } from '../schemas/channel.schema';
import { Chat, ChatDocument } from '../schemas/chat.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { UserChatMessages, UserChatMessagesDocument } from '../schemas/user.chat.messages.schema';
import { Message, MessageDocument } from '../schemas/message.schema';
import { Photo, PhotoDocument } from '../schemas/photo.schema';
import { Model } from 'mongoose';
import { TelegramService } from '../telegram/telegram.service';
import * as _ from 'lodash';
import { betterConsoleLog } from 'telegram/Helpers';

@Injectable()
export class DataService {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Photo.name) private photoModel: Model<PhotoDocument>,
    @InjectModel(UserChatMessages.name) private userChatMessagesModel: Model<UserChatMessagesDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private telegramService: TelegramService
  ){
    setTimeout(()=>{
      this.scanChannel('voenacher');
    }, 2000)

  }

  async user(){
    // for(let i = 0; i < users.length-1; i++){
    //   //let avatar = this.getUserBase64Photo(users[i]['id'].toString());
    //   await new this.userModel({
    //     bot: users[i]['bot'],
    //     verified: users[i]['verified'],
    //     fake: users[i]['fake'],
    //     id: users[i]['id'].toString(),
    //     firstName: users[i]['firstName'],
    //     lastName: users[i]['lastName'],
    //     username: users[i]['username'],
    //     phone: users[i]['phone'],
    //     avatar: null,
    //   }).save()
    // }
  }

  async scanChannel(channel: string){
    const channelData = await this.telegramService.getChannelData(channel);
    if(_.has(channelData, 'fullChat')){
      const chat = await this.chatModel.findOne({id: channelData.fullChat.id.toString()}).exec();
      if(_.isNil(chat)){
        let savedChat = await new this.channelModel({
          blocked: channelData.fullChat['blocked'],
          id: channelData.fullChat['id'].toString(),
          participantsCount: channelData.fullChat['participantsCount'],
          adminsCount: channelData.fullChat['adminsCount'],
          kickedCount: channelData.fullChat['kickedCount'],
          bannedCount: channelData.fullChat['bannedCount'],
          onlineCount: channelData.fullChat['onlineCount'],
          migratedFromChatId: _.isNil(channelData.fullChat['migratedFromChatId'])?null:channelData.fullChat['migratedFromChatId'].toString(),
          linkedChatId: _.isNil(channelData.fullChat['linkedChatId'])?null: channelData.fullChat['linkedChatId'].toString(),
          location: channelData.fullChat['location'],
          about: channelData.fullChat['about'],
          scanDate: new Date()
        }).save();

      }else{
        //TODO compare and update
        return chat
      }
    }else{
      return channelData
    }
    console.log(channelData);

    // if(result.chats.length>0){
    //   _.forEach(result.chats, (chat)=>{
    //     new this.chatModel({
    //       channelId: result.fullChat['id'].toString(),
    //       id: chat.id.toString(),
    //       username: chat.username,
    //       verified: chat.verified,
    //       hasLink: chat.hasLink,
    //       hasGeo: chat.hasGeo,
    //       title: chat.title,
    //       date: chat.date
    //     }).save();
    //   })
    // }
  }

  async addChat(){

  }

  async message(){

  }
}
