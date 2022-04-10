import { Injectable } from '@nestjs/common';
import { InjectModel, Prop } from '@nestjs/mongoose';
import { Channel, ChannelDocument } from '../schemas/channel.schema';
import { Chat, ChatDocument } from '../schemas/chat.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { UserChatMessages, UserChatMessagesDocument } from '../schemas/user.chat.messages.schema';
import { Message, MessageDocument } from '../schemas/message.schema';
import { Photo, PhotoDocument } from '../schemas/photo.schema';
import mongoose, { Model } from 'mongoose';
import { TelegramService } from '../telegram/telegram.service';
import * as _ from 'lodash';
import { Api } from 'telegram';
import messages = Api.messages;
import TypeMessage = Api.TypeMessage;

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
      this.getChatMessages('pnvcomment');
    }, 2000)

  }

  async scanChannel(channel: string){
    const channelData = await this.telegramService.getChannelData(channel);
    if(_.has(channelData, 'fullChat')){
      const channel = await this.channelModel.findOne({id: channelData.fullChat.id.toString()}).exec();
      if(_.isNil(channel)){
        let chats: Array<mongoose.Schema.Types.ObjectId> = [];
        if(channelData.chats.length>0){
          for(let i = 0; i< channelData.chats.length; i++){
            let chat = await this.addChat(channelData.chats[i], channelData.fullChat['id'].toString());
            chats.push(chat['_id']);
          }
        }
        await new this.channelModel({
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
          scanDate: new Date(),
          chats: chats
        }).save();
      }else{
        //TODO add chats if have some difference
        return channel
      }
    }else{
      return channelData
    }
  }

  async addChat(chat: Chat, channelId: string){
    const oldChat = await this.chatModel.findOne({id: chat.id.toString()}).exec();
    if(_.isNil(oldChat)){
      return  await new this.chatModel({
        channelId: channelId,
        id: chat.id.toString(),
        username: chat.username,
        verified: chat.verified,
        hasLink: chat.hasLink,
        hasGeo: chat.hasGeo,
        title: chat.title,
        date: chat.date
      }).save();
    }else{
      return oldChat
    }
  }

  async scanChatUsers(chat: string){
    const users: Array<User> = await this.telegramService.getUsersFromChat(chat);
    const userChat = await this.chatModel.findOne({username: chat});
    userChat.usersCount = users.length;
    await userChat.save();
    if(_.isArray(users)){
      for(let i = 0; i < users.length-1; i++){
        const oldUser = await this.userModel.findOne({id: users[i].id.toString()}).exec();
        if(_.isNil(oldUser)){
          await this.addUser(users[i], userChat);
          //TODO check and  move to sheduler cause its long process
          //await this.addUserPhotos(users[i]['id'].toString(), newUser._id)
        }
      }
    }
  }

  async addUser(user, userChat){
    await new this.userModel({
      bot: user['bot'],
      verified: user['verified'],
      fake: user['fake'],
      id: user['id'].toString(),
      firstName: user['firstName'],
      lastName: user['lastName'],
      username: user['username'],
      phone: user['phone'],
      chats: [userChat._id]
    }).save();
  }

  async addUserPhotos(userId: string, userMongoId: mongoose.Schema.Types.ObjectId){
    const userPhotos = await this.telegramService.getUserPhotos(userId);
    let photos: Array<mongoose.Schema.Types.ObjectId> = [];
    if(userPhotos.photos.length>0){
      for(let i = 0; i < userPhotos.photos.length; i++){
        const photoData = userPhotos.photos[i];
        const oldPhoto = this.photoModel.findOne({id: photoData.id.toString()}).exec();
        if(_.isNil(oldPhoto)){
          const newPhoto = await new this.photoModel({
            userMongoId,
            id:photoData.id.toString(),
            accessHash:photoData['accessHash'].toString(),
            fileReference:photoData['fileReference']
          });
          photos.push(newPhoto._id)
        }
      }
    }
    if(photos.length>0){
      const up = await this.userModel.findByIdAndUpdate(userMongoId, {photos}).exec();
      console.log(up);
    }
  }

  async getChatMessages(chat: string){
    let offset = 0;
    const chatMessagesData: messages.ChannelMessages = await this.telegramService.getChatMessages(chat, 100, offset) as messages.ChannelMessages;
    const chatObj = await this.chatModel.findOne({username: chat}).exec();
    await this.processMessages(chatMessagesData.messages, chatObj._id);
    const count: number = Number(chatMessagesData.count);
    for(let i = 0; i<Math.floor((count-100)/100)+1; i++){
      offset+=100;
      const chatMessagesData: messages.ChannelMessages = await this.telegramService.getChatMessages(chat, 100, offset) as messages.ChannelMessages;
      await this.processMessages(chatMessagesData.messages, chatObj._id);
      console.log('MESSAGES PROCESSED:', offset)
    }
    console.log('MESSAGES DONE')
  }
  private async createChatMessages(chatMongoId, user){
    const chatMessages = await new this.userChatMessagesModel({
      messagesCount: 1,
      chatMongoId
    }).save();
    user.userChatMessages.push(chatMessages);
    await user.save();
    return chatMessages;
  }

  async processMessages(messages: Array<TypeMessage>, chatMongoId){
    for(let i = 0; i<messages.length; i++){
      const message: TypeMessage = messages[i];
      if(_.has(message, 'fromId.userId')){
        const user = await this.userModel.findOne({id: message['fromId'].userId.toString()}).populate('userChatMessages').exec();
        if(!_.isNil(user)){
          let chatMessages;
          if(user.userChatMessages.length === 0){
            chatMessages = await this.createChatMessages(chatMongoId, user);
          }else{
            chatMessages = _.find(user.userChatMessages, (chatMessages)=> chatMessages.chatMongoId === chatMongoId);
            if(_.isNil(chatMessages)){
              chatMessages = await this.createChatMessages(chatMongoId, user);
            }else{
              chatMessages = chatMessages.messagesCount+=1;
              await chatMessages.save()
            }
          }
          if(chatMessages.savedMessagesCount<50){
            await this.addMessage(message, chatMessages);
          }
        }
      }
    }
  }

  async addMessage(message: TypeMessage, userChatMessages: UserChatMessagesDocument){
    const oldMessage = await this.messageModel.findOne({id: message.id.toString()});
    if(_.isNil(oldMessage)){
      await new  this.messageModel({
        UserChatMessagesMongoId: userChatMessages._id,
        message: message['message'],
        id: message.id.toString(),
        fromId: message["fromId"].userId.toString(),
        date: message['date']
      }).save();
      userChatMessages.savedMessagesCount += 1;
      await userChatMessages.save();
      console.log(userChatMessages.savedMessagesCount);
    }
  }
}
