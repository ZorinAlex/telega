import { Injectable } from '@nestjs/common';
import { StringSession } from 'telegram/sessions';
import { Api, TelegramClient } from 'telegram';
import { Session, SessionDocument } from '../schemas/session.schema';
import { InjectModel, Prop } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Channel, ChannelDocument } from '../schemas/channel.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Chat, ChatDocument } from '../schemas/chat.schema';
import { ConfigService } from '@nestjs/config';
const input = require("input");
import * as _ from 'lodash';
import BigInteger = require('big-integer');
import UserInfo = Api.help.UserInfo;
import btoa from 'btoa'

@Injectable()
export class TelegramService {

  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService
  ){
    (async ()=>{
      await this.auth();
      //await this.getChannelData('voenacher');
      await this.getUsersFromChat("voenacher")
      //await this.getUserAvatar('5101912316')
      //let res = await this.getUserPhotos('435962850')
      // console.log(res.users[0].id.toString());
    })()
  }

  protected client: TelegramClient;

  async auth(){
    const sessions: Array<SessionDocument> = await this.sessionModel.find().exec();
    if (sessions.length>0) {
      const session: SessionDocument = sessions[0];
      const stringSession = new StringSession(session.session);
      this.client = new TelegramClient(stringSession, Number(this.configService.get('telegram').apiId), this.configService.get('telegram').apiHash, {
        connectionRetries: 5,
      });
      await this.client.connect();
    }else{
      this.startClient();
    }
  }

  async startClient(){
    await this.client.start({
      phoneNumber: async () => await input.text("Please enter your number: "),
      password: async () => await input.text("Please enter your password: "),
      phoneCode: async () =>
        await input.text("Please enter the code you received: "),
      onError: (err) => console.log(err),
    });
    console.log("You should now be connected.");
    const session = this.client.session.save();
    new this.sessionModel({session}).save();
  }

  async sendCode(phone: string){
    const stringSession = new StringSession("");
    this.client = new TelegramClient(stringSession, Number(this.configService.get('telegram').apiId), this.configService.get('telegram').apiHash, {
      connectionRetries: 5,
    });
    await this.client.connect();
    await this.client.sendCode({
      apiId:Number(this.configService.get('telegram').apiId),
      apiHash:this.configService.get('telegram').apiHash
    }, phone);
  }

  async getChannelData(channel: string, save: boolean = false){
    const result = await this.client.invoke(
        new Api.channels.GetFullChannel({
            channel: channel,
        })
    );
    if(save){
      await new this.channelModel({
        blocked: result.fullChat['blocked'],
        id: result.fullChat['id'].toString(),
        participantsCount: result.fullChat['participantsCount'],
        adminsCount: result.fullChat['adminsCount'],
        kickedCount: result.fullChat['kickedCount'],
        bannedCount: result.fullChat['bannedCount'],
        onlineCount: result.fullChat['onlineCount'],
        migratedFromChatId: _.isNil(result.fullChat['migratedFromChatId'])?null:result.fullChat['migratedFromChatId'].toString(),
        linkedChatId: _.isNil(result.fullChat['linkedChatId'])?null: result.fullChat['linkedChatId'].toString(),
        location: result.fullChat['location'],
      }).save();
      if(result.chats.length>0){
        _.forEach(result.chats, (chat)=>{
          new this.chatModel({
            channelId: result.fullChat['id'].toString(),
            id: chat.id.toString(),
            username: chat.username,
            verified: chat.verified,
            hasLink: chat.hasLink,
            hasGeo: chat.hasGeo,
            title: chat.title,
            date: chat.date
          }).save();
        })
      }
    }
    return result
  }

  async getUsersFromChat(chat: string, save: boolean = false){
    try {
      let users :Array<UserInfo> = [];
      let offset: number = 0;
      let result;
      result = await this.getChatUsersParams(100, offset, chat);
      users.push(...result.users);
      offset+=100;
      for(let i = 0; i<Math.floor((736 - 100) / 100)+1;i++){
        result = await this.getChatUsersParams(100, offset, chat);
        users.push(...result.users);
        offset+=100;
      }
      if(save){
        for(let i = 0; i < users.length-1; i++){
          //let avatar = this.getUserBase64Photo(users[i]['id'].toString());
          await new this.userModel({
            bot: users[i]['bot'],
            verified: users[i]['verified'],
            fake: users[i]['fake'],
            id: users[i]['id'].toString(),
            firstName: users[i]['firstName'],
            lastName: users[i]['lastName'],
            username: users[i]['username'],
            phone: users[i]['phone'],
            avatar: null,
          }).save()
        }
      }
    }catch (e) {
      return e.message
    }
  }

  private  toBase64(arr) {
    arr = new Uint8Array(arr);
    return btoa(
      arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
  }

  async getUserPhotos(user: string){
    try {
      return await this.client.invoke(
        new Api.photos.GetUserPhotos({
          userId: BigInteger(user),
          offset: 0,
          // @ts-ignore
          maxId: 0,
          limit: 100,
        })
      );
    }catch (e) {
      return null
    }
  }

  async getUserBase64Photo(userId: string){
    const userPhotos = await this.getUserPhotos(userId);
    if(!_.isNil(userPhotos) && userPhotos.photos.length>0){
      const photo = userPhotos.photos[0];
      console.log(photo);
      if(_.has(photo, 'fileReference')){
        const buffer = await this.client.downloadFile(
          new Api.InputPhotoFileLocation({
            id: photo.id,
            // @ts-ignore
            accessHash: photo.accessHash,
            // @ts-ignore
            fileReference: photo.fileReference,
            thumbSize: "a"
          }),
          {
            // @ts-ignore
            dcId: photo.dcId,
            fileSize: 1024*1024,
          });
        return this.toBase64(buffer);
      }
    }
    return null
  }


  private async getChatUsersParams(limit: number, offset:number, chat: string){
    return  await this.client.invoke(
      new Api.channels.GetParticipants({
        channel: chat,
        // @ts-ignore
        filter: new Api.ChannelParticipantsRecent({}),
        offset: offset,
        limit: limit,
        // @ts-ignore
        hash: 0,
      })
    );
  }


}
