import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TelegramService } from '../telegram/telegram.service';
import * as _ from 'lodash';
import { join } from 'path';
import * as fs from 'fs';
import { Photo, PhotoDocument } from '../schemas/photo.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserPhotosService {
  constructor(
    @InjectModel(Photo.name) private photoModel: Model<PhotoDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private telegramService: TelegramService
  ){
    (async ()=>{
      await this.preload()
      setTimeout(()=>{
        this.scan();
      }, 2000)
    })()
  }

  private totalUsersForScan: number;

  private async preload(){
    this.totalUsersForScan = await this.userModel.count({isPhotosScanned: null}).exec();
  }

  private async getUsersPack(): Promise<Array<UserDocument>>{
    return await this.userModel.find({isPhotosScanned: null}).limit(100).exec()
  }

  private async scan(){
    const users: Array<UserDocument> = await this.getUsersPack();
    if(!_.isNil(users)){
      await this.scanUsersPhotos(users);
      this.scan()
    }
  }

  private async scanUsersPhotos(users: Array<UserDocument>){
    for(let index = 0; index< users.length; index++){
      const user: UserDocument = users[index];
      let photos = [];
      let photosDB = [];
      if(!_.isNil(user.username)){
        photos = await this.telegramService.getUserPhotos(user.username, false);
      }else{
        photos = await this.telegramService.getUserPhotos(user.id, true);
      }
      if(!_.isNil(photos)){
        for(let photoIndex = 0; photoIndex < photos.length; photoIndex++){
          const savePath = join(__dirname, '../../', 'photos/', user._id.toString(), '/', photoIndex+'.jpg');
          const userfolder = join(__dirname, '../../', 'photos/', user._id.toString());
          if (!fs.existsSync(userfolder)){
            await fs.mkdirSync(userfolder);
            console.log('Folder Created Successfully.');
          }
          const newPhoto = await new this.photoModel({
            userMongoId: user._id,
            path: savePath,
          }).save();
          photosDB.push(newPhoto);
          await fs.writeFileSync(savePath, photos[photoIndex]);
        }
      }
      user.isPhotosScanned = true;
      user.photos = photosDB;
      await user.save()
    }
  }

}
