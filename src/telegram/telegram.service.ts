import { Injectable } from '@nestjs/common';
import { StringSession } from 'telegram/sessions';
import { Api, TelegramClient } from 'telegram';
import { Session, SessionDocument } from '../schemas/session.schema';
import { InjectModel, Prop } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
    private configService: ConfigService
  ){
    (async ()=>{
      await this.auth();
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
    const stringSession = new StringSession("");
    this.client = new TelegramClient(stringSession, Number(this.configService.get('telegram').apiId), this.configService.get('telegram').apiHash, {
      connectionRetries: 5,
    });
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

  async getChannelData(channel: string){
    try {
      return await this.client.invoke(
        new Api.channels.GetFullChannel({
          channel: channel,
        })
      );
    }catch (e) {
      return e.message
    }
  }

  async getUsersFromChat(chat: string){
    try {
      let users :Array<UserInfo> = [];
      let offset: number = 0;
      let result;
      result = await this.getChatUsersParams(100, offset, chat);
      users.push(...result.users);
      offset+=100;
      for(let i = 0; i<Math.floor((Number(result.count) - 100) / 100)+1;i++){
        result = await this.getChatUsersParams(100, offset, chat);
        users.push(...result.users);
        offset+=100;
      }
      return users
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

  async getChatMessages(chat: string){
    const result = await this.client.invoke(
      new Api.messages.GetHistory({
        peer: "pnvcomment",
        offsetId: 0,
        offsetDate: 0,
        addOffset: 0,
        limit: 10,
        maxId: 0,
        minId: 0,
        // @ts-ignore
        hash: 0,
      })
    );
  }

  async getUsersNearby(coordinates: Array<number>){
    const result = await this.client.invoke(
        new Api.contacts.GetLocated({
            geoPoint: new Api.InputGeoPoint({
                lat: 49.881885305228366,
                long: 28.56640119324312,
                accuracyRadius: 50,
            }),
            selfExpires: 43,
        })
    );
  }
}
