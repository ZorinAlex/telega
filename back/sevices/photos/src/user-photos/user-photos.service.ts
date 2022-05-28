import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TelegramService } from '../telegram/telegram.service';
import * as _ from 'lodash';
import { join } from 'path';
import * as fs from 'fs';
import { Photo, PhotoDocument } from '../schemas/photo.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
const ConsoleProgressBar = require('console-progress-bar');

@Injectable()
export class UserPhotosService {
  private logger: Logger = new Logger('User Photo');
  private consoleProgressBar: typeof ConsoleProgressBar;
  private isBusy: boolean = false;

  constructor(
    @InjectModel(Photo.name) private photoModel: Model<PhotoDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private telegramService: TelegramService,
  ) {
    (async () => {
      await this.preload();
    })();
  }

  private totalUsersForScan: number;

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async preload() {
    if(!this.isBusy){
      this.logger.log('Scan started');
      this.totalUsersForScan = await this.userModel.count({ isPhotosScanned: false }).exec();
      this.consoleProgressBar = new ConsoleProgressBar({ maxValue: this.totalUsersForScan });
      setTimeout(() => {
        this.scan();
      }, 10000);
    }
  }

  private async getUsersPack(): Promise<Array<UserDocument>>{
    return await this.userModel.find({isPhotosScanned: false}).limit(100).exec()
  }

  private async scan() {
    this.isBusy = true;
    const users: Array<UserDocument> = await this.getUsersPack();
    if(!_.isNil(users) && users.length > 0){
      await this.scanUsersPhotos(users);
      this.scan()
    }else {
      this.isBusy = false;
    }
  }

  private async cleanUsers(){
    await this.userModel.updateMany({isPhotosScanned: true}, {isPhotosScanned: false})
  }

  private async scanUsersPhotos(users: Array<UserDocument>){
    for(let index = 0; index< users.length; index++){
      const user: UserDocument = users[index];
      let photos = [];
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
            this.logger.log('Folder Created for:', user._id.toString());
          }
          await new this.photoModel({
            userMongoId: user._id,
            path: savePath,
          }).save();
          await fs.writeFileSync(savePath, photos[photoIndex]);
        }
      }
      user.isPhotosScanned = true;
      await user.save();
      this.consoleProgressBar.addValue(1);
    }
  }

  async status(){
    return {
      busy: this.isBusy,
      toScan: await this.userModel.count({ isPhotosScanned: false }).exec(),
      scanned: await this.userModel.count({ isPhotosScanned: true }).exec()
    }
  }

}
