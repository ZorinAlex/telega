import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
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
import { EScannerState } from './enums/scanner.state.enum';
import messages = Api.messages;
import TypeMessage = Api.TypeMessage;
const ConsoleProgressBar = require('console-progress-bar');

@Injectable()
export class DataService {
  private usersCache: Map<string, UserDocument> = new Map();
  private chatsQueue: Array<string> = [];
  private scannerState: EScannerState = EScannerState.FREE;
  private useUsersCache: boolean = false;

  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Photo.name) private photoModel: Model<PhotoDocument>,
    @InjectModel(UserChatMessages.name) private userChatMessagesModel: Model<UserChatMessagesDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private telegramService: TelegramService
  ){}

  addChats(chats: Array<string>){
    this.chatsQueue.push(...chats);
    this.startScan();
    return this.chatsQueue;
  }

  private startScan(fromStop: boolean = false){
    if(fromStop){
      const channelName: string = this.chatsQueue.shift();
      this.fullChatScan(channelName);
    }else{
      if(this.scannerState === EScannerState.BUSY) return;
      this.scannerState = EScannerState.BUSY;
      const channelName: string = this.chatsQueue.shift();
      this.fullChatScan(channelName);
    }
  }

  private stopScan(){
    if(this.chatsQueue.length>0){
      this.startScan(true)
    }else{
      this.scannerState = EScannerState.FREE;
    }
  }

  async fullChatScan(channel: string){
    const channelData = await this.scanChannel(channel);
    if(!_.isNil(channelData) && !_.isNil(channelData.chats)){
      console.log('CHANNEL SCAN FOR: ', channel);
      console.log('CHANNEL DATA SCANNED, CHATS FOUND: ', channelData.chats.length);
      for(let i = 0; i<channelData.chats.length; i++){
        await this.scanChatUsers(channelData.chats[i].id, channelData.chats[i].accessHash);
        await this.getChatMessages(channelData.chats[i].id, channelData.chats[i].accessHash);
      }
    }else{
      console.log('CHANNEL NO DATA: ', channelData);
    }
    this.stopScan();
  }

  async scanChannel(channelName: string){
    const channelData = await this.telegramService.getChannelData(channelName);
    if(_.has(channelData, 'fullChat')){
      const channel = await this.channelModel.findOne({id: channelData.fullChat.id.toString()}).populate('chats').exec();
      if(_.isNil(channel)){
        let chats: Array<mongoose.Schema.Types.ObjectId> = [];
        if(channelData.chats.length>0){
          for(let i = 0; i< channelData.chats.length; i++){
            let chat = await this.addChat(channelData.chats[i], channelData.fullChat['id'].toString());
            chats.push(chat['_id']);
          }
        }
        await new this.channelModel({
          name: channelName,
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
        return await this.channelModel.findOne({id: channelData.fullChat.id.toString()}).populate('chats').exec();
      }else{
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
        accessHash: chat.accessHash.toString(),
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

  async scanChatUsers(chatId: string, accessHash: string){
    const users: Array<User> = await this.telegramService.getUsersFromChatByPeer(chatId, accessHash);
    const userChat = await this.chatModel.findOne({id: chatId});
    userChat.usersCount = users.length;
    console.log('USERS SCAN: ', users.length);
    const consoleProgressBar = new ConsoleProgressBar({ maxValue: users.length-1 });
    await userChat.save();
    if(_.isArray(users)){
      for(let i = 0; i < users.length; i++){
        const oldUser = await this.userModel.findOne({id: users[i].id.toString()}).exec();
        if(_.isNil(oldUser)){
          await this.addUser(users[i], userChat);
        }else{
          const chatIndex: number = _.findIndex(oldUser.chats, (chat)=> chat.equals(userChat._id));
          if(chatIndex<0){
            oldUser.chats.push(userChat._id);
            await oldUser.save()
          }
        }
        consoleProgressBar.addValue(1);
      }
    }
    console.log("CHAT USERS PROCESSED")
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

  async getChatMessages(chatId: string, accessHash: string){
    if (this.useUsersCache) this.usersCache.clear();
    let offset = 0;
    const chatMessagesData: messages.ChannelMessages = await this.telegramService.getChatMessagesByPeer(chatId, accessHash,100, offset) as messages.ChannelMessages;
    const chatObj = await this.chatModel.findOne({id: chatId}).exec();
    await this.processMessages(chatMessagesData.messages, chatObj._id);
    const count: number = Number(chatMessagesData.count);
    chatObj.messagesCount = count;
    await chatObj.save();
    console.log('MESSAGES TOTAL:', count);
    const consoleProgressBar = new ConsoleProgressBar({ maxValue: Math.floor((count-100)/100)+1 });
    for(let i = 0; i<Math.floor((count-100)/100)+1; i++){
      offset+=100;
      const chatMessagesData: messages.ChannelMessages = await this.telegramService.getChatMessagesByPeer(chatId, accessHash, 100, offset) as messages.ChannelMessages;
      await this.processMessages(chatMessagesData.messages, chatObj._id);
      consoleProgressBar.addValue(1);
    }
    console.log('MESSAGES SCAN DONE');
    if (this.useUsersCache) await this.saveUserMessagesData(chatObj._id);
    console.log('MESSAGES DATA SAVED')
  }

  private async saveUserMessagesData(chatMongoId: mongoose.Schema.Types.ObjectId){
    for (const user of this.usersCache.values()) {
      await user.save();
      const chatMessages = _.find(user.userChatMessages, (chatMes)=> chatMes.chatMongoId.equals(chatMongoId));
      if(!_.isNil(chatMessages)){
        await chatMessages.save();
      }
    }
  }

  private async createChatMessages(chatMongoId, user){
    const chatMessages = await new this.userChatMessagesModel({
      userMongoId: user._id,
      messagesCount: 1,
      chatMongoId
    }).save();
    user.userChatMessages.push(chatMessages);
    if (!this.useUsersCache) await user.save();
    return chatMessages;
  }

  async processMessages(messages: Array<TypeMessage>, chatMongoId){
    for(let i = 0; i<messages.length; i++){
      const message: TypeMessage = messages[i];
      if(_.has(message, 'fromId.userId')){
        let user;
        if(this.useUsersCache && this.usersCache.has(message['fromId'].userId.toString())){
          user = this.usersCache.get(message['fromId'].userId.toString())
        }else{
          user = await this.userModel.findOne({id: message['fromId'].userId.toString()}).populate('userChatMessages').exec();
          if(this.useUsersCache && !_.isNil(user)){
            this.usersCache.set(message['fromId'].userId.toString(), user)
          }
        }
        if(!_.isNil(user)){
          let chatMessages;
          if(user.userChatMessages.length === 0){
            chatMessages = await this.createChatMessages(chatMongoId, user);
          }else{
            chatMessages = _.find(user.userChatMessages, (chatMes)=> chatMes.chatMongoId.equals(chatMongoId));
            if(_.isNil(chatMessages)){
              chatMessages = await this.createChatMessages(chatMongoId, user);
            }else{
              chatMessages.messagesCount+=1;
              if (!this.useUsersCache)await chatMessages.save()
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
      if (!this.useUsersCache) await userChatMessages.save();
    }
  }
}