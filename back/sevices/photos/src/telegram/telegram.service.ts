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
import * as btoa from 'btoa'
import { join } from "path";
import * as fs from "fs";

@Injectable()
export class TelegramService {

  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private configService: ConfigService
  ){
    (async ()=>{
      await this.auth();
      //await this.test();
    })()
  }
  protected serviceName: string = 'photos';
  protected client: TelegramClient;

  async auth(){
    const sessions: Array<SessionDocument> = await this.sessionModel.find({service: this.serviceName}).exec();
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
    const DBSession = {session: session, service: this.serviceName};
    new this.sessionModel(DBSession).save();
  }

  private  toBase64(arr) {
    arr = new Uint8Array(arr);
    return btoa(
      arr.reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
  }

  private async getUserPhotosById(userId: string){
    try {
      return await this.client.invoke(
        new Api.photos.GetUserPhotos({
          userId: BigInteger(userId),
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

  private async getUserPhotosByUsername(username: string){
    try {
      return await this.client.invoke(
        new Api.photos.GetUserPhotos({
          userId: username,
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

  async getUserPhotos(data: string, byUserId: boolean){
    let userPhotos;
    if(byUserId){
      userPhotos = await this.getUserPhotosById(data);
    }else{
      userPhotos = await this.getUserPhotosByUsername(data);
    }
    if(!_.isNil(userPhotos) && userPhotos.photos.length>0){
      const photos = [];
      for(let i=0; i< userPhotos.photos.length; i++){
        const photo = userPhotos.photos[i];
        if(_.has(photo, 'fileReference')){
          const buffer = await this.client.downloadFile(
            new Api.InputPhotoFileLocation({
              id: photo.id,
              // @ts-ignore
              accessHash: photo.accessHash,
              // @ts-ignore
              fileReference: photo.fileReference,
              thumbSize: "b"
            }),
            {
              // @ts-ignore
              dcId: photo.dcId,
              fileSize: 1024*1024,
            });
            photos.push(buffer);
        }
      }
      return photos
    }
    return null
  }

  async test(){
    const photos = await this.getUserPhotos('Solopvova', false);
    for(let i=0; i< photos.length; i++){
      const savePath = join(__dirname, '../../', 'photos/', '123456', '/', i+'.jpg');
      const userfolder = join(__dirname, '../../', 'photos/', '123456');
      if (!fs.existsSync(userfolder)){
        await fs.mkdirSync(userfolder);
        console.log('Folder Created Successfully.');
      }
      await fs.writeFileSync(savePath, photos[i]);
    }

  }

  //USR PHOTO
  // const result = await client.invoke(
  //     new Api.photos.GetUserPhotos({
  //         userId: "Solopvova",
  //         offset: 0,
  //         maxId: 0,
  //         limit: 100,
  //     })
  // );
  // console.log(result.photos[1]);
  //
  // const photo = result.photos[1];
  // const buffer = await client.downloadFile(
  //     new Api.InputPhotoFileLocation({
  //         id: photo.id,
  //         accessHash: photo.accessHash,
  //         fileReference: photo.fileReference,
  //         thumbSize: "a"
  //     }),
  //     {
  //         dcId: photo.dcId,
  //         fileSize: 1024*1024,
  //     });
  // console.log(toBase64(buffer));
  // console.log("Downloaded image is", buffer);
  //     fs.writeFileSync("picture.jpg", buffer);

}
